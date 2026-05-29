"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Mic, MicOff, Square, Pause, Play, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import type { Meeting } from "@/types/index"

type RecordingStep = "setup" | "recording" | "paused" | "processing" | "done" | "error"

type ProcessingStage = "uploading" | "transcribing" | "generating"

const PROCESSING_STAGES: { key: ProcessingStage; label: string; estimatedMs: number }[] = [
  { key: "uploading", label: "Envoi de l'audio…", estimatedMs: 3000 },
  { key: "transcribing", label: "Transcription en cours…", estimatedMs: 30000 },
  { key: "generating", label: "Génération du CR…", estimatedMs: 15000 },
]

interface MeetingRecorderProps {
  open: boolean
  onClose: () => void
  projectId: string
  authorName: string
  contributors: Array<{ id: string; name: string }>
  onMeetingCreated: (meeting: Meeting) => void
}

export function MeetingRecorder({
  open,
  onClose,
  projectId,
  authorName,
  contributors,
  onMeetingCreated,
}: MeetingRecorderProps) {
  const [step, setStep] = useState<RecordingStep>("setup")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("uploading")
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const stageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pré-coche l'architecte + tous les contributors dès l'ouverture
  useEffect(() => {
    if (!open) return
    const names = [authorName, ...contributors.map((c) => c.name)]
    setSelectedParticipants(names)
  }, [open, authorName, contributors])

  // Reset à la fermeture
  useEffect(() => {
    if (!open) {
      resetState()
    }
  }, [open])

  const resetState = () => {
    stopTimer()
    releaseWakeLock()
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    audioChunksRef.current = []
    setStep("setup")
    setNotes("")
    setTimerSeconds(0)
    setError(null)
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const acquireWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen")
      }
    } catch {
      // WakeLock non critique — on ignore
    }
  }

  const releaseWakeLock = () => {
    wakeLockRef.current?.release().catch(() => {})
    wakeLockRef.current = null
  }

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }

  const handleStartRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Format compatible iOS Safari
      const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm"

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.start(1000)
      setStep("recording")
      startTimer()
      await acquireWakeLock()

      // Arrêt automatique à 2h
      setTimeout(
        () => {
          if (mediaRecorderRef.current?.state === "recording") {
            void handleStopRecording()
          }
        },
        2 * 3600 * 1000
      )
    } catch (e) {
      const err = e as Error
      if (err.name === "NotAllowedError") {
        setError(
          "Permission micro refusée. Autorisez le microphone dans les réglages de votre navigateur."
        )
      } else {
        setError("Impossible d'accéder au microphone.")
      }
    }
  }

  const handlePause = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause()
      stopTimer()
      setStep("paused")
    }
  }

  const handleResume = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume()
      startTimer()
      setStep("recording")
    }
  }

  const handleStopRecording = useCallback(() => {
    return new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder) {
        resolve()
        return
      }

      recorder.onstop = () => resolve()
      if (recorder.state !== "inactive") recorder.stop()

      // Arrêt de tous les tracks
      recorder.stream?.getTracks().forEach((t) => t.stop())
      stopTimer()
      releaseWakeLock()
    })
  }, [])

  const handleProcess = async () => {
    await handleStopRecording()
    setStep("processing")
    setProcessingStage("uploading")

    // Avancement des étapes basé sur les estimations
    let delay = 0
    for (let i = 0; i < PROCESSING_STAGES.length - 1; i++) {
      delay += PROCESSING_STAGES[i].estimatedMs
      const stage = PROCESSING_STAGES[i + 1].key
      stageTimeoutRef.current = setTimeout(() => setProcessingStage(stage), delay)
    }

    try {
      const mimeType = audioChunksRef.current[0]?.type || "audio/mp4"
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

      const fd = new FormData()
      fd.append("projectId", projectId)
      fd.append("participants", JSON.stringify(selectedParticipants))
      if (notes.trim()) fd.append("notes", notes.trim())
      if (audioBlob.size > 0) fd.append("audio", audioBlob, "audio.mp4")

      const res = await fetch("/api/meetings", { method: "POST", body: fd })
      if (!res.ok) throw new Error(await res.text())

      const meeting = (await res.json()) as Meeting

      if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current)
      setStep("done")
      onMeetingCreated(meeting)
    } catch (e) {
      console.error("[MeetingRecorder]", e)
      if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current)
      setError("Une erreur est survenue lors du traitement. Réessayez.")
      setStep("error")
    }
  }

  const allParticipants = [
    { name: authorName, isAuthor: true },
    ...contributors.map((c) => ({ name: c.name, isAuthor: false })),
  ]

  const toggleParticipant = (name: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    )
  }

  const currentStageIndex = PROCESSING_STAGES.findIndex((s) => s.key === processingStage)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && step !== "processing") onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "done" ? "CR généré" : "Nouvelle réunion de chantier"}
          </DialogTitle>
        </DialogHeader>

        {/* SETUP */}
        {step === "setup" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium">Participants présents</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allParticipants.map(({ name }) => (
                  <label key={name} className="flex items-center gap-3 cursor-pointer group py-1">
                    <Checkbox
                      checked={selectedParticipants.includes(name)}
                      onCheckedChange={() => toggleParticipant(name)}
                    />
                    <span className="text-sm">{name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Notes rapides (optionnel)</p>
              <Textarea
                placeholder="Points à ne pas oublier…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handleStartRecording} disabled={selectedParticipants.length === 0}>
                <Mic className="h-4 w-4 mr-2" />
                Démarrer
              </Button>
            </div>
          </div>
        )}

        {/* RECORDING / PAUSED */}
        {(step === "recording" || step === "paused") && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3 py-4">
              <div
                className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center",
                  step === "recording" ? "bg-destructive/10 animate-pulse" : "bg-muted"
                )}
              >
                {step === "recording" ? (
                  <Mic className="h-7 w-7 text-destructive" />
                ) : (
                  <MicOff className="h-7 w-7 text-muted-foreground" />
                )}
              </div>

              <span className="text-3xl font-mono font-semibold tabular-nums">
                {formatTimer(timerSeconds)}
              </span>

              <span className="text-sm text-muted-foreground">
                {step === "recording" ? "Enregistrement en cours…" : "En pause"}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Notes rapides
              </p>
              <Textarea
                placeholder="Décisions, points importants…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            <div className="flex gap-2 justify-center">
              {step === "recording" ? (
                <Button variant="outline" size="icon" onClick={handlePause}>
                  <Pause className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="outline" size="icon" onClick={handleResume}>
                  <Play className="h-4 w-4" />
                </Button>
              )}
              <Button variant="destructive" onClick={handleProcess} className="gap-2">
                <Square className="h-4 w-4" />
                Arrêter et générer le CR
              </Button>
            </div>
          </div>
        )}

        {/* PROCESSING */}
        {step === "processing" && (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              {PROCESSING_STAGES.map((stage, i) => {
                const done = i < currentStageIndex
                const active = i === currentStageIndex
                return (
                  <div key={stage.key} className="flex items-center gap-3">
                    <div className="h-6 w-6 flex items-center justify-center shrink-0">
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : active ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm",
                        done && "text-muted-foreground line-through",
                        active && "font-medium",
                        !done && !active && "text-muted-foreground"
                      )}
                    >
                      {stage.label}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Ne quittez pas cette page pendant le traitement.
            </p>
          </div>
        )}

        {/* DONE */}
        {step === "done" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 text-primary">
              <CheckCircle2 className="h-6 w-6" />
              <p className="font-medium">Compte-rendu généré avec succès</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Le CR est maintenant visible dans la Discussion chantier. Vous pouvez l&apos;éditer
              avant de l&apos;envoyer aux participants.
            </p>
            <div className="flex justify-end">
              <Button onClick={onClose}>Fermer</Button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {step === "error" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Fermer
              </Button>
              <Button onClick={() => setStep("setup")}>Réessayer</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
