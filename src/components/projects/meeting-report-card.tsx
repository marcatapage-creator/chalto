"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  Pencil,
  Check,
  Send,
  ListTodo,
  Loader2,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from "lucide-react"
import type { Meeting, MeetingReport, MeetingAction } from "@/types/index"

interface MeetingReportCardProps {
  meeting: Meeting
  onUpdated: (meeting: Meeting) => void
}

export function MeetingReportCard({ meeting, onUpdated }: MeetingReportCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [draftReport, setDraftReport] = useState<MeetingReport>(
    meeting.report ?? { decisions: [], actions: [], points_en_suspens: [], prochaine_reunion: null }
  )
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [creatingTasks, setCreatingTasks] = useState(false)
  const [tasksDone, setTasksDone] = useState(false)
  const [sentDone, setSentDone] = useState(meeting.status === "sent")
  const [error, setError] = useState<string | null>(null)

  const meetingDate = new Date(meeting.meeting_date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  })

  const handleSaveSection = async () => {
    if (!draftReport) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: draftReport }),
      })
      if (!res.ok) throw new Error()
      const updated = (await res.json()) as Meeting
      onUpdated(updated)
      setEditingSection(null)
    } catch {
      setError("Erreur lors de la sauvegarde.")
    } finally {
      setSaving(false)
    }
  }

  const handleSendToAll = async () => {
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/send`, { method: "POST" })
      if (!res.ok) throw new Error()
      setSentDone(true)
    } catch {
      setError("Erreur lors de l'envoi.")
    } finally {
      setSending(false)
    }
  }

  const handleCreateTasks = async () => {
    setCreatingTasks(true)
    setError(null)
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/tasks`, { method: "POST" })
      if (!res.ok) throw new Error()
      const { created } = (await res.json()) as { created: number }
      setTasksDone(true)
      void created
    } catch {
      setError("Erreur lors de la création des tâches.")
    } finally {
      setCreatingTasks(false)
    }
  }

  const updateAction = (index: number, field: keyof MeetingAction, value: string) => {
    if (!draftReport) return
    const newActions = draftReport.actions.map((a, i) =>
      i === index ? { ...a, [field]: value || null } : a
    )
    setDraftReport({ ...draftReport, actions: newActions })
  }

  const report = draftReport

  return (
    <div className="border rounded-xl overflow-hidden bg-white dark:bg-card max-w-2xl">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm">
              Réunion n°{meeting.meeting_number ?? "—"} — {meetingDate}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {(meeting.participants as string[]).join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {sentDone && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Envoyé
            </span>
          )}
          {report && (
            <span className="text-xs text-muted-foreground">
              {report.actions.length} action{report.actions.length !== 1 ? "s" : ""}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              !expanded && "-rotate-90"
            )}
          />
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="border-t px-4 py-4 space-y-5">
          {meeting.status === "processing" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Génération du compte-rendu en cours…
            </div>
          )}

          {meeting.status !== "processing" && (
            <>
              {/* Présents */}
              <Section
                title="Présents"
                icon="👥"
                editing={editingSection === "presents"}
                onEdit={() => setEditingSection("presents")}
                onSave={handleSaveSection}
                saving={saving}
              >
                {editingSection === "presents" ? (
                  <Textarea
                    value={(meeting.participants as string[]).join("\n")}
                    rows={3}
                    className="text-sm resize-none"
                    readOnly
                  />
                ) : (
                  <ul className="space-y-1">
                    {(meeting.participants as string[]).map((p, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* Décisions */}
              <Section
                title="Décisions"
                icon="✅"
                editing={editingSection === "decisions"}
                onEdit={() => setEditingSection("decisions")}
                onSave={handleSaveSection}
                saving={saving}
                empty={report.decisions.length === 0}
              >
                {editingSection === "decisions" ? (
                  <Textarea
                    value={report.decisions.join("\n")}
                    rows={Math.max(3, report.decisions.length + 1)}
                    className="text-sm resize-none"
                    onChange={(e) =>
                      setDraftReport({
                        ...report,
                        decisions: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                  />
                ) : (
                  <ul className="space-y-1.5">
                    {report.decisions.length === 0 ? (
                      <li className="text-sm text-muted-foreground italic">
                        Aucune décision enregistrée
                      </li>
                    ) : (
                      report.decisions.map((d, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0 mt-1.5" />
                          {d}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </Section>

              {/* Actions */}
              <Section
                title="Actions"
                icon="⚡"
                editing={editingSection === "actions"}
                onEdit={() => setEditingSection("actions")}
                onSave={handleSaveSection}
                saving={saving}
                empty={report.actions.length === 0}
              >
                {editingSection === "actions" ? (
                  <div className="space-y-3">
                    {report.actions.map((action, i) => (
                      <div key={i} className="grid gap-1.5 p-3 border rounded-lg bg-muted/30">
                        <Input
                          value={action.titre}
                          onChange={(e) => updateAction(i, "titre", e.target.value)}
                          placeholder="Action"
                          className="text-sm h-8"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <Input
                            value={action.responsable ?? ""}
                            onChange={(e) => updateAction(i, "responsable", e.target.value)}
                            placeholder="Responsable"
                            className="text-sm h-8"
                          />
                          <Input
                            value={action.echeance ?? ""}
                            onChange={(e) => updateAction(i, "echeance", e.target.value)}
                            placeholder="Échéance"
                            className="text-sm h-8"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {report.actions.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Aucune action définie</p>
                    ) : (
                      report.actions.map((action, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 text-sm"
                        >
                          <ListTodo className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{action.titre}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {[action.responsable, action.echeance].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Section>

              {/* Points en suspens */}
              <Section
                title="Points en suspens"
                icon="⏳"
                editing={editingSection === "suspens"}
                onEdit={() => setEditingSection("suspens")}
                onSave={handleSaveSection}
                saving={saving}
                empty={report.points_en_suspens.length === 0}
              >
                {editingSection === "suspens" ? (
                  <Textarea
                    value={report.points_en_suspens.join("\n")}
                    rows={Math.max(3, report.points_en_suspens.length + 1)}
                    className="text-sm resize-none"
                    onChange={(e) =>
                      setDraftReport({
                        ...report,
                        points_en_suspens: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                  />
                ) : (
                  <ul className="space-y-1.5">
                    {report.points_en_suspens.length === 0 ? (
                      <li className="text-sm text-muted-foreground italic">
                        Aucun point en suspens
                      </li>
                    ) : (
                      report.points_en_suspens.map((p, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500/70 shrink-0 mt-1.5" />
                          {p}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </Section>

              {/* Prochaine réunion */}
              {report.prochaine_reunion && (
                <Section
                  title="Prochaine réunion"
                  icon="📅"
                  editing={editingSection === "next"}
                  onEdit={() => setEditingSection("next")}
                  onSave={handleSaveSection}
                  saving={saving}
                >
                  {editingSection === "next" && report.prochaine_reunion ? (
                    <div className="space-y-2">
                      {(["date", "lieu", "ordre_du_jour"] as const).map((field) => (
                        <Input
                          key={field}
                          value={report.prochaine_reunion![field] ?? ""}
                          onChange={(e) =>
                            setDraftReport({
                              ...report,
                              prochaine_reunion: {
                                ...report.prochaine_reunion!,
                                [field]: e.target.value || null,
                              },
                            })
                          }
                          placeholder={
                            field === "date" ? "Date" : field === "lieu" ? "Lieu" : "Ordre du jour"
                          }
                          className="text-sm h-8"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      {report.prochaine_reunion.date && (
                        <p>
                          <span className="text-muted-foreground">Date : </span>
                          {report.prochaine_reunion.date}
                        </p>
                      )}
                      {report.prochaine_reunion.lieu && (
                        <p>
                          <span className="text-muted-foreground">Lieu : </span>
                          {report.prochaine_reunion.lieu}
                        </p>
                      )}
                      {report.prochaine_reunion.ordre_du_jour && (
                        <p>
                          <span className="text-muted-foreground">Ordre du jour : </span>
                          {report.prochaine_reunion.ordre_du_jour}
                        </p>
                      )}
                    </div>
                  )}
                </Section>
              )}
            </>
          )}

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions bar */}
          {meeting.status !== "processing" && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendToAll}
                disabled={sending || sentDone}
                className="gap-2"
              >
                {sending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : sentDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {sentDone ? "Envoyé" : "Envoyer à tous"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateTasks}
                disabled={creatingTasks || tasksDone || report.actions.length === 0}
                className="gap-2"
              >
                {creatingTasks ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : tasksDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <ListTodo className="h-3.5 w-3.5" />
                )}
                {tasksDone ? "Tâches créées" : "Créer les tâches"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  icon,
  children,
  editing,
  onEdit,
  onSave,
  saving,
  empty,
}: {
  title: string
  icon: string
  children: React.ReactNode
  editing: boolean
  onEdit: () => void
  onSave: () => void
  saving: boolean
  empty?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-1.5">
          <span>{icon}</span>
          {title}
          {empty && !editing && (
            <span className="text-xs font-normal text-muted-foreground">(vide)</span>
          )}
        </p>
        {editing ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={onSave}
            disabled={saving}
            className="h-7 px-2 gap-1"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Sauvegarder
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 px-2 gap-1">
            <Pencil className="h-3 w-3" />
            Modifier
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}
