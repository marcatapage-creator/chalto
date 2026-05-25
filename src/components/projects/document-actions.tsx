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
  isChantier?: boolean
  onSent?: (info?: AudienceInfo) => void
  onStatusChange?: (status: string) => void
  onClose: () => void
}

interface DocumentActionsProps {
  documentId: string
  documentName: string
  projectId: string
  clientName?: string
  status: string
  fileUrl?: string | null
  isChantier?: boolean
  className?: string
  onSent?: (info?: AudienceInfo) => void
  onStatusChange?: (status: string) => void
  onOpenSend?: () => void
}

const REQUEST_TYPE_OPTIONS = [
  { value: "validation", label: "Pour validation" },
  { value: "transmission", label: "Pour information" },
] as const

function RequestTypeSelector({
  value,
  onChange,
  options = REQUEST_TYPE_OPTIONS,
}: {
  value: "validation" | "transmission"
  onChange: (v: "validation" | "transmission") => void
  options?: readonly { value: "validation" | "transmission"; label: string }[]
}) {
  return (
    <>
      <div className="sm:hidden">
        <Select value={value} onValueChange={(v) => onChange(v as "validation" | "transmission")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
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
        className={cn("hidden sm:grid gap-2", options.length === 1 ? "grid-cols-1" : "grid-cols-2")}
      >
        {options.map(({ value: val, label }) => (
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
  isChantier = false,
  onSent,
  onStatusChange,
  onClose,
}: DocumentSendFormProps) {
  // approved en chantier → seul le presta est disponible
  const [audience, setAudience] = useState<"client" | "contributor">(
    status === "approved" && isChantier ? "contributor" : "client"
  )
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [selectedContributors, setSelectedContributors] = useState<string[]>([])
  // approved + contributor → forcé en transmission (le doc client est figé)
  const [requestType, setRequestType] = useState<"validation" | "transmission">(
    status === "approved" ? "transmission" : "validation"
  )

  // doc approuvé envoyé aux prestataires → uniquement pour information
  const isApprovedContributor = status === "approved" && audience === "contributor"
  // commented + client → seule la validation a du sens (le client a déjà lu pour info)
  const requestTypeOptions = isApprovedContributor
    ? ([{ value: "transmission", label: "Pour information" }] as const)
    : audience === "client" && status === "commented"
      ? ([{ value: "validation", label: "Pour validation" }] as const)
      : REQUEST_TYPE_OPTIONS
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
        const res = await fetchWithTimeout("/api/send-to-contributors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            documentName,
            projectId,
            contributorIds: selectedContributors,
            requestType,
            message: message || undefined,
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          console.error("[send-to-contributors]", errData)
          toast.error((errData as { error?: string }).error ?? "Erreur lors de l'envoi")
          setLoading(false)
          return
        }

        // DB is authoritative — update UI immediately
        onStatusChange?.("sent")
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
      {/* Audience — sélecteur visible en chantier quand client est encore disponible */}
      {isChantier && status !== "approved" && (
        <div className="grid grid-cols-2 gap-2">
          {(["client", "contributor"] as const).map((a) => (
            <button
              key={a}
              onClick={() => {
                setAudience(a)
                // commented + client : forcer validation (déjà lu pour info)
                if (a === "client" && status === "commented") setRequestType("validation")
              }}
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
      {isApprovedContributor ? (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          Ce document a été approuvé par le client — il sera transmis pour information uniquement.
          Le prestataire ne peut pas le refuser.
        </p>
      ) : (
        <RequestTypeSelector
          value={requestType}
          onChange={setRequestType}
          options={requestTypeOptions}
        />
      )}

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
  isChantier = false,
  className,
  onSent,
  onStatusChange,
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
            isChantier={isChantier}
            onSent={onSent}
            onStatusChange={onStatusChange}
            onClose={() => setOpen(false)}
          />
        </ResponsiveDialog>
      )}
    </>
  )
}
