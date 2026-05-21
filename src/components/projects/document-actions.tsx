"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Send, User, Users, CheckCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { haptics } from "@/lib/haptics"
import { analytics } from "@/lib/analytics"
import { toast } from "sonner"
import { OnboardingTooltip } from "@/components/ui/onboarding-tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { fetchWithTimeout } from "@/lib/fetch-timeout"
import { scrollOnFocus } from "@/hooks/use-scroll-on-focus"
import type { AudienceInfo } from "./document-panel-types"

interface Contributor {
  id: string
  name: string
  professions?: { label: string } | null
}

interface DocumentSendFormProps {
  documentId: string
  documentName: string
  projectId: string
  clientName?: string
  status: string
  fileUrl?: string | null
  onSent?: (info?: AudienceInfo) => void
  onClose: () => void
}

interface DocumentActionsProps {
  documentId: string
  documentName: string
  projectId: string
  clientName?: string
  status: string
  fileUrl?: string | null
  className?: string
  onSent?: (info?: AudienceInfo) => void
  onOpenSend?: () => void
}

const REQUEST_TYPE_OPTIONS = [
  { value: "validation", label: "Pour validation" },
  { value: "transmission", label: "Pour information" },
] as const

function RequestTypeSelector({
  value,
  onChange,
}: {
  value: "validation" | "transmission"
  onChange: (v: "validation" | "transmission") => void
}) {
  return (
    <>
      <div className="sm:hidden">
        <Select value={value} onValueChange={(v) => onChange(v as "validation" | "transmission")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REQUEST_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as "validation" | "transmission")}
        className="hidden sm:grid grid-cols-2 gap-2"
      >
        {REQUEST_TYPE_OPTIONS.map(({ value: val, label }) => (
          <Label
            key={val}
            htmlFor={`rt-${val}`}
            className={cn(
              "flex items-center gap-2.5 cursor-pointer rounded-lg border-2 px-3 py-2.5 text-sm transition-all select-none",
              value === val
                ? "border-primary bg-primary/5 font-medium"
                : "border-border hover:border-primary/50 font-normal text-muted-foreground"
            )}
          >
            <RadioGroupItem id={`rt-${val}`} value={val} />
            {label}
          </Label>
        ))}
      </RadioGroup>
    </>
  )
}

/**
 * Formulaire d'envoi — utilisé dans la dialog desktop.
 * Sur mobile, l'envoi passe par la page dédiée /send.
 */
export function DocumentSendForm({
  documentId,
  documentName,
  projectId,
  clientName,
  status,
  fileUrl,
  onSent,
  onClose,
}: DocumentSendFormProps) {
  const [audience, setAudience] = useState<"client" | "contributor">(
    status === "approved" ? "contributor" : "client"
  )
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [selectedContributors, setSelectedContributors] = useState<string[]>([])
  const [requestType, setRequestType] = useState<"validation" | "transmission">("validation")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase
      .from("contributors")
      .select("id, name, professions(label)")
      .eq("project_id", projectId)
      .then(({ data }) => {
        if (data) setContributors(data)
      })
  }, [projectId, supabase])

  const toggleContributor = (id: string) => {
    setSelectedContributors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleSend = async () => {
    if (audience === "contributor" && selectedContributors.length === 0) {
      toast.error("Sélectionnez au moins un prestataire")
      return
    }

    onClose()
    setLoading(true)

    if (audience === "contributor" && selectedContributors.length > 0) {
      const selectedNames = contributors
        .filter((c) => selectedContributors.includes(c.id))
        .map((c) => c.name)
      onSent?.({ requestType, names: selectedNames, inviteTokens: [] })
    } else {
      onSent?.()
    }

    try {
      if (audience === "client") {
        const res = await fetchWithTimeout("/api/send-validation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId, message: message || undefined, requestType }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(
            data.error === "Pas d'email client"
              ? "Ajoutez l'email du client dans le projet"
              : (data.error ?? "Erreur lors de l'envoi")
          )
          setLoading(false)
          return
        }
        haptics.success()
        analytics.documentSent()
        toast.success(
          requestType === "transmission"
            ? "Document transmis au client ✅"
            : "Email de validation envoyé au client ✅"
        )
      } else {
        const { error: rpcError } = await supabase.rpc("send_document_to_client", {
          p_document_id: documentId,
          p_status: "sent",
        })

        if (rpcError) {
          console.error("[send_document_to_client]", rpcError)
          toast.error("Erreur lors de la mise à jour du document — réessayez")
          setLoading(false)
          return
        }

        await supabase.from("documents").update({ audience: "contributor" }).eq("id", documentId)

        const { error: upsertError } = await supabase.from("document_contributors").upsert(
          selectedContributors.map((contributorId) => ({
            document_id: documentId,
            contributor_id: contributorId,
            request_type: requestType,
            pro_message: message || null,
          })),
          { onConflict: "document_id,contributor_id" }
        )
        if (upsertError) console.error("[document_contributors upsert]", upsertError)

        const emailRes = await fetchWithTimeout("/api/send-document-contributor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contributorIds: selectedContributors,
            documentName,
            projectId,
            message: message || undefined,
            requestType,
          }),
        })

        if (!emailRes.ok) {
          const errData = await emailRes.json().catch(() => ({}))
          console.error("[send-document-contributor]", errData)
          toast.error((errData as { error?: string }).error ?? "Erreur lors de l'envoi email")
          setLoading(false)
          return
        }

        haptics.success()
        toast.success("Document envoyé aux prestataires ✅")
      }
    } catch {
      toast.error("Erreur réseau — réessayez")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Audience */}
      {status !== "approved" && (
        <div className="grid grid-cols-2 gap-2">
          {(["client", "contributor"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAudience(a)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all",
                audience === a
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              )}
            >
              {a === "client" ? (
                <User className="h-4 w-4 text-primary" />
              ) : (
                <Users className="h-4 w-4 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {a === "client" ? "Client" : "Prestataire(s)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {a === "client" ? (clientName ?? "Lien de validation") : "Équipe projet"}
                </p>
              </div>
              {audience === a && <Check className="h-3.5 w-3.5 text-primary ml-auto shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {/* Sélection prestataires */}
      {audience === "contributor" && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Prestataires
          </p>
          {contributors.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Aucun prestataire sur ce projet</p>
          ) : (
            <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto">
              {contributors.map((c) => {
                const selected = selectedContributors.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleContributor(c.id)}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg border-2 text-left transition-all",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                        selected ? "border-primary bg-primary" : "border-muted-foreground/40"
                      )}
                    >
                      {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      {c.professions?.label && (
                        <p className="text-xs text-muted-foreground truncate">
                          {c.professions.label}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Type de demande */}
      <RequestTypeSelector value={requestType} onChange={setRequestType} />

      {/* Message facultatif */}
      <Textarea
        placeholder={
          audience === "client"
            ? "Ajouter un mot pour le client (facultatif)..."
            : "Ajouter un mot pour le(s) prestataire(s) (facultatif)..."
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={scrollOnFocus}
        rows={2}
        className="resize-none text-sm"
      />

      {/* Bouton envoyer */}
      <Button
        className="w-full"
        onClick={handleSend}
        disabled={
          loading ||
          (audience === "client" && requestType === "validation" && !fileUrl) ||
          (audience === "contributor" && selectedContributors.length === 0)
        }
        loading={loading}
      >
        <Send className="h-4 w-4 mr-2" />
        {status === "approved" ? "Partager" : "Envoyer"}
      </Button>
    </div>
  )
}

export function DocumentActions({
  documentId,
  documentName,
  projectId,
  clientName,
  status,
  fileUrl,
  className,
  onSent,
  onOpenSend,
}: DocumentActionsProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {status === "approved" && (
        <Badge variant="outline" className="text-primary border-primary shrink-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approuvé
        </Badge>
      )}
      <OnboardingTooltip
        id="send-document"
        title="Envoyez au client"
        description="Envoyez un lien sécurisé à votre client — il valide sans créer de compte."
        position="top"
        align="start"
        className="w-full"
      >
        <Button
          size="sm"
          variant={status === "approved" ? "outline" : "default"}
          onClick={() => (onOpenSend ? onOpenSend() : setOpen(true))}
          disabled={status === "sent"}
          className={cn(className)}
        >
          <Send className="h-4 w-4 mr-2" />
          {status === "sent" ? "Envoyé" : status === "approved" ? "Partager" : "Envoyer"}
        </Button>
      </OnboardingTooltip>

      {!onOpenSend && (
        <ResponsiveDialog
          open={open}
          onOpenChange={setOpen}
          title={status === "approved" ? "Partager avec un prestataire" : "Envoyer ce document"}
          description="Choisissez le type de requête"
          contentClassName="sm:max-w-md"
        >
          <DocumentSendForm
            documentId={documentId}
            documentName={documentName}
            projectId={projectId}
            clientName={clientName}
            status={status}
            fileUrl={fileUrl}
            onSent={onSent}
            onClose={() => setOpen(false)}
          />
        </ResponsiveDialog>
      )}
    </>
  )
}
