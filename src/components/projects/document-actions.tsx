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
import { Badge } from "@/components/ui/badge"
import { Send, User, Users, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { haptics } from "@/lib/haptics"
import { analytics } from "@/lib/analytics"
import { toast } from "sonner"

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
  className?: string
  onSent?: () => void
}

export function DocumentActions({
  documentId,
  documentName,
  projectId,
  clientName,
  status,
  className,
  onSent,
}: DocumentActionsProps) {
  const [open, setOpen] = useState(false)
  const [audience, setAudience] = useState<"client" | "contributor">("client")
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [selectedContributors, setSelectedContributors] = useState<string[]>([])
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
        await fetch("/api/send-validation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId, message: message || null }),
        })

        haptics.success()
        analytics.documentSent()
        toast.success("Email de validation envoyé au client ✅")
      } else {
        if (selectedContributors.length === 0) {
          toast.error("Sélectionnez au moins un prestataire")
          setLoading(false)
          return
        }

        await supabase
          .from("documents")
          .update({ status: "sent", audience: "contributor" })
          .eq("id", documentId)

        await supabase.from("document_contributors").insert(
          selectedContributors.map((contributorId) => ({
            document_id: documentId,
            contributor_id: contributorId,
          }))
        )

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

  if (status === "approved") {
    return (
      <Badge variant="outline" className="text-primary border-primary">
        <CheckCircle className="h-3 w-3 mr-1" />
        Approuvé
      </Badge>
    )
  }

  return (
    <>
      <Button
        size="sm"
        variant="default"
        onClick={() => setOpen(true)}
        disabled={status === "sent"}
        className={cn(className)}
      >
        <Send className="h-4 w-4 mr-2" />
        {status === "sent" ? "Envoyé" : "Envoyer"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer ce document</DialogTitle>
            <DialogDescription>
              Choisissez à qui envoyer &quot;{documentName}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Choix audience */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAudience("client")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  audience === "client"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <User
                  className={cn(
                    "h-6 w-6",
                    audience === "client" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="text-sm font-medium">Mon client</span>
                {clientName && <span className="text-xs text-muted-foreground">{clientName}</span>}
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
                          <CheckCircle className="h-3 w-3 text-primary-foreground" />
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
                loading || (audience === "contributor" && selectedContributors.length === 0)
              }
            >
              <Send className="h-4 w-4 mr-2" />
              {loading
                ? "Envoi en cours..."
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
