"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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

interface Contributor {
  id: string
  name: string
  professions?: { label: string }[] | null
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
  onSent?: () => void
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
      {/* Mobile : Select dropdown */}
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

      {/* Desktop : boutons radio stylisés */}
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
}: DocumentActionsProps) {
  const [open, setOpen] = useState(false)
  const [audience, setAudience] = useState<"client" | "contributor">("client")
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [selectedContributors, setSelectedContributors] = useState<string[]>([])
  const [requestType, setRequestType] = useState<"validation" | "transmission">("validation")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!open) return
    supabase
      .from("contributors")
      .select("id, name, professions(label)")
      .eq("project_id", projectId)
      .then(({ data }) => {
        if (data) setContributors(data)
      })
  }, [open, projectId, supabase])

  const toggleContributor = (id: string) => {
    setSelectedContributors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleSend = async () => {
    setLoading(true)

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
        if (selectedContributors.length === 0) {
          toast.error("Sélectionnez au moins un prestataire")
          setLoading(false)
          return
        }

        const { error: rpcError } = await supabase.rpc("send_document_to_client", {
          p_document_id: documentId,
          p_status: status === "approved" ? "approved" : "sent",
        })

        if (rpcError) {
          console.error("[send_document_to_client]", rpcError)
          toast.error("Erreur lors de la mise à jour du document — réessayez")
          setLoading(false)
          return
        }

        await supabase.from("document_contributors").upsert(
          selectedContributors.map((contributorId) => ({
            document_id: documentId,
            contributor_id: contributorId,
            request_type: requestType,
            pro_message: message || null,
          })),
          { onConflict: "document_id,contributor_id" }
        )

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
          console.error("[send-document-contributor]", emailRes.status)
          toast.error("Erreur lors de l'envoi de l'email — réessayez")
          setLoading(false)
          return
        }

        haptics.success()
        toast.success(`Document partagé avec ${selectedContributors.length} prestataire(s) ✅`)
      }

      setMessage("")
      setOpen(false)
      onSent?.()
    } catch (error) {
      console.error(error)
      toast.error("Une erreur est survenue")
    }

    setLoading(false)
  }

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
          onClick={() => {
            if (status === "approved") setAudience("contributor")
            setOpen(true)
          }}
          disabled={status === "sent"}
          className={cn(className)}
        >
          <Send className="h-4 w-4 mr-2" />
          {status === "sent" ? "Envoyé" : status === "approved" ? "Partager" : "Envoyer"}
        </Button>
      </OnboardingTooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer ce document</DialogTitle>
            <DialogDescription>
              Choisissez à qui envoyer &quot;{documentName}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Choix audience — prestataires uniquement en phase chantier */}
            {isChantier && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => status !== "approved" && setAudience("client")}
                  disabled={status === "approved"}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    status === "approved"
                      ? "border-border opacity-40 cursor-not-allowed"
                      : audience === "client"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                  )}
                >
                  <User
                    className={cn(
                      "h-6 w-6",
                      audience === "client" && status !== "approved"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="text-sm font-medium">Mon client</span>
                  {status === "approved" ? (
                    <span className="text-xs text-muted-foreground">Déjà approuvé</span>
                  ) : (
                    clientName && (
                      <span className="text-xs text-muted-foreground">{clientName}</span>
                    )
                  )}
                </button>

                <button
                  onClick={() => setAudience("contributor")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    audience === "contributor"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Users
                    className={cn(
                      "h-6 w-6",
                      audience === "contributor" ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span className="text-sm font-medium">Prestataires</span>
                  <span className="text-xs text-muted-foreground">
                    {contributors.length} sur le projet
                  </span>
                </button>
              </div>
            )}

            {/* Sélection prestataires */}
            {audience === "contributor" && (
              <div className="space-y-2">
                {contributors.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun prestataire sur ce projet
                  </p>
                ) : (
                  contributors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => toggleContributor(c.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                        selectedContributors.includes(c.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                          selectedContributors.includes(c.id)
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {selectedContributors.includes(c.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.professions?.[0]?.label}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Type de demande (client + prestataires) */}
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
            >
              <Send className="h-4 w-4 mr-2" />
              {loading
                ? "Envoi en cours..."
                : audience === "client" && requestType === "validation" && !fileUrl
                  ? "Uploadez un fichier d'abord"
                  : audience === "client"
                    ? "Envoyer au client"
                    : `Envoyer à ${selectedContributors.length} prestataire(s)`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
