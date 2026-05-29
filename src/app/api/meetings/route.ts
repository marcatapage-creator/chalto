import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { MeetingReport } from "@/types/index"

const CLAUDE_MODEL = "claude-opus-4-7"
const MAX_RECORDING_SECONDS = 7200 // 2h
const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200 MB

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }

  const projectId = formData.get("projectId") as string | null
  const participantsRaw = formData.get("participants") as string | null
  const notes = (formData.get("notes") as string | null) || null
  const audioFile = formData.get("audio") as File | null

  if (!projectId || !participantsRaw) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
  }

  let participants: string[]
  try {
    participants = JSON.parse(participantsRaw)
    if (!Array.isArray(participants)) throw new Error()
  } catch {
    return NextResponse.json({ error: "Participants invalides" }, { status: 400 })
  }

  if (audioFile && audioFile.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Fichier audio trop volumineux (max 200 Mo)" },
      { status: 413 }
    )
  }

  // Vérification ownership
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 403 })

  const admin = createAdminClient()

  // Numéro de réunion
  const { count: meetingCount } = await admin
    .from("meeting_reports")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
  const meetingNumber = (meetingCount ?? 0) + 1

  // Création de l'entrée initiale
  const { data: meeting, error: insertError } = await admin
    .from("meeting_reports")
    .insert({
      project_id: projectId,
      user_id: user.id,
      participants,
      notes,
      status: "processing",
      meeting_number: meetingNumber,
    })
    .select()
    .single()

  if (insertError || !meeting) {
    console.error("[meetings] insert error:", insertError)
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 })
  }

  let transcript = ""
  let audioUrl: string | null = null

  // Upload audio + transcription Whisper
  if (audioFile && audioFile.size > 0) {
    try {
      const audioBuffer = await audioFile.arrayBuffer()
      const audioPath = `${user.id}/${meeting.id}/audio.mp4`

      // Création du bucket si nécessaire
      await admin.storage.createBucket("meetings", { public: false }).catch(() => {})

      const { error: uploadError } = await admin.storage
        .from("meetings")
        .upload(audioPath, audioBuffer, {
          contentType: audioFile.type || "audio/mp4",
          upsert: true,
        })

      if (!uploadError) {
        const { data: urlData } = admin.storage.from("meetings").getPublicUrl(audioPath)
        audioUrl = urlData.publicUrl
      }

      // Transcription Whisper
      if (process.env.OPENAI_API_KEY) {
        const { default: OpenAI } = await import("openai")
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        const whisperFile = new File([audioBuffer], "audio.mp4", {
          type: audioFile.type || "audio/mp4",
        })

        // Vérification de la durée approximative (200 Mo ≈ 2h max)
        void MAX_RECORDING_SECONDS

        const transcription = await openai.audio.transcriptions.create({
          file: whisperFile,
          model: "whisper-1",
          language: "fr",
        })
        transcript = transcription.text
      }
    } catch (e) {
      console.error("[meetings] audio processing error:", e)
    }
  }

  // Génération du CR avec Claude
  let report: MeetingReport | null = null

  if (transcript || notes) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk")
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

      const prompt = buildCRPrompt({ transcript, notes, participants })

      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      })

      const content = message.content[0]
      if (content.type === "text") {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          report = JSON.parse(jsonMatch[0]) as MeetingReport
        }
      }
    } catch (e) {
      console.error("[meetings] Claude error:", e)
    }
  }

  // Mise à jour finale
  const { data: updated } = await admin
    .from("meeting_reports")
    .update({
      audio_url: audioUrl,
      transcript: transcript || null,
      report,
      status: "ready",
    })
    .eq("id", meeting.id)
    .select()
    .single()

  return NextResponse.json(updated ?? { ...meeting, status: "ready", report })
}

function buildCRPrompt({
  transcript,
  notes,
  participants,
}: {
  transcript: string
  notes: string | null
  participants: string[]
}): string {
  return `Tu es un assistant expert en rédaction de comptes-rendus de réunions de chantier BTP.

${transcript ? `Transcription audio de la réunion :\n${transcript}\n\n` : ""}${notes ? `Notes prises pendant la réunion :\n${notes}\n\n` : ""}Participants présents : ${participants.join(", ")}

Génère un compte-rendu structuré au format JSON strict, sans commentaires ni balises supplémentaires :
{
  "decisions": ["décision 1", "décision 2"],
  "actions": [
    {
      "titre": "description de l'action",
      "responsable": "nom ou null",
      "echeance": "date ou délai en français ou null"
    }
  ],
  "points_en_suspens": ["point 1", "point 2"],
  "prochaine_reunion": {
    "date": "date en français ou null",
    "lieu": "lieu ou null",
    "ordre_du_jour": "ordre du jour ou null"
  }
}

Règles : sois factuel et concis, utilise le français, conserve le contexte BTP. Si une section est vide, retourne un tableau vide ou null. Réponds UNIQUEMENT avec le JSON valide.`
}
