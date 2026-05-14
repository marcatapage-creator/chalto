"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { scrollOnFocus } from "@/hooks/use-scroll-on-focus"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Send, User, Users, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { haptics } from "@/lib/haptics"
import { analytics } from "@/lib/analytics"
import { fetchWithTimeout } from "@/lib/fetch-timeout"

interface Contributor {
  id: string
  name: string
  professions?: { label: string } | null
}

interface SendPageClientProps {
  document: {
    id: string
    name: string
    status: string
    file_url: string | null
    project_id: string
  }
  projectId: string
  clientName?: string
  isChantier: boolean
}

const REQUEST_TYPE_OPTIONS = [
  { value: "validation", label: "Pour validation" },
  { value: "transmission", label: "Pour information" },
] as const

const slideVariants = {
  enter: (dir: number) => ({ x: `${dir * 30}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: `${dir * -20}%`, opacity: 0 }),
}

export function SendPageClient({
  document,
  projectId,
  clientName,
  isChantier,
}: SendPageClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [step, setStep] = useState<1 | 2>(1)
  const [stepDir, setStepDir] = useState(1)
  const [audience, setAudience] = useState<"client" | "contributor">(
    document.status === "approved" && isChantier ? "contributor" : "client"
  )
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [selectedContributors, setSelectedContributors] = useState<string[]>([])
  const [requestType, setRequestType] = useState<"validation" | "transmission">("validation")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

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

  const goToStep2 = () => {
    if (audience === "contributor" && selectedContributors.length === 0) {
      toast.error("Sélectionnez au moins un prestataire")
      return
    }
    setStepDir(1)
    setStep(2)
  }

  const goToStep1 = () => {
    setStepDir(-1)
    setStep(1)
  }

  const handleSend = async () => {
    setLoading(true)

    try {
      if (audience === "client") {
        const res = await fetchWithTimeout("/api/send-validation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: document.id,
            message: message || undefined,
            requestType,
          }),
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
          p_document_id: document.id,
          p_status: "sent",
        })
        if (rpcError) {
          toast.error("Erreur lors de la mise à jour du document — réessayez")
          setLoading(false)
          return
        }

        await supabase.from("documents").update({ audience: "contributor" }).eq("id", document.id)

        const { error: upsertError } = await supabase.from("document_contributors").upsert(
          selectedContributors.map((contributorId) => ({
            document_id: document.id,
            contributor_id: contributorId,
            request_type: requestType,
            pro_message: message || null,
          })),
          { onConflict: "document_id,contributor_id" }
        )
        if (upsertError) console.error("[document_contributors upsert]", upsertError)

        await fetchWithTimeout("/api/send-document-contributor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: document.id,
            contributorIds: selectedContributors,
            message: message || undefined,
            requestType,
          }),
        })

        haptics.success()
        toast.success("Document envoyé aux prestataires ✅")
      }

      router.push(`/projects/${projectId}`)
      router.refresh()
    } catch {
      toast.error("Erreur réseau — réessayez")
      setLoading(false)
    }
  }

  const isApproved = document.status === "approved"
  const pageTitle = isApproved ? "Partager avec un prestataire" : "Envoyer ce document"
  const canSend = audience === "client" || selectedContributors.length > 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3 bg-popover">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() => (step === 2 ? goToStep1() : router.back())}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{pageTitle}</p>
          <p className="text-xs text-muted-foreground truncate">{document.name}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          {([1, 2] as const).map((s) => (
            <div
              key={s}
              className={cn(
                "rounded-full transition-all duration-300",
                s === step ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-border"
              )}
            />
          ))}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-lg mx-auto px-4 py-6">
          <AnimatePresence mode="wait" initial={false} custom={stepDir}>
            <motion.div
              key={step}
              custom={stepDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* ── Étape 1 : Destinataire ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold mb-1">À qui envoyer ?</p>
                    <p className="text-xs text-muted-foreground">
                      Choisissez qui recevra ce document
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(!isApproved || !isChantier) && (
                      <button
                        onClick={() => setAudience("client")}
                        className={cn(
                          "flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all",
                          !isChantier ? "col-span-2" : "",
                          audience === "client"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          {audience === "client" && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Client</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {clientName ?? "Lien de validation"}
                          </p>
                        </div>
                      </button>
                    )}
                    {isChantier && (
                      <button
                        onClick={() => setAudience("contributor")}
                        className={cn(
                          "flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all",
                          isApproved ? "col-span-2" : "",
                          audience === "contributor"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          {audience === "contributor" && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Prestataire(s)</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Partager avec l&apos;équipe
                          </p>
                        </div>
                      </button>
                    )}
                  </div>

                  {audience === "contributor" && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Sélectionner les prestataires
                      </p>
                      {contributors.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          Aucun prestataire sur ce projet
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {contributors.map((c) => {
                            const selected = selectedContributors.includes(c.id)
                            return (
                              <button
                                key={c.id}
                                onClick={() => toggleContributor(c.id)}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all h-14",
                                  selected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/30"
                                )}
                              >
                                <div
                                  className={cn(
                                    "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                    selected
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground/40"
                                  )}
                                >
                                  {selected && (
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  )}
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
                </div>
              )}

              {/* ── Étape 2 : Modalité ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold mb-1">Type de demande</p>
                    <p className="text-xs text-muted-foreground">
                      {audience === "client"
                        ? `Envoi à ${clientName ?? "votre client"}`
                        : `Envoi à ${selectedContributors.length} prestataire${selectedContributors.length > 1 ? "s" : ""}`}
                    </p>
                  </div>

                  {/* Mobile : Select */}
                  <div className="sm:hidden">
                    <Select
                      value={requestType}
                      onValueChange={(v) => setRequestType(v as "validation" | "transmission")}
                    >
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

                  {/* Desktop : radio stylisé */}
                  <RadioGroup
                    value={requestType}
                    onValueChange={(v) => setRequestType(v as "validation" | "transmission")}
                    className="hidden sm:grid grid-cols-2 gap-2"
                  >
                    {REQUEST_TYPE_OPTIONS.map(({ value, label }) => (
                      <Label
                        key={value}
                        htmlFor={`rt-${value}`}
                        className={cn(
                          "flex items-center gap-2.5 cursor-pointer rounded-lg border-2 px-3 py-2.5 text-sm transition-all select-none",
                          requestType === value
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-border hover:border-primary/50 font-normal text-muted-foreground"
                        )}
                      >
                        <RadioGroupItem id={`rt-${value}`} value={value} />
                        {label}
                      </Label>
                    ))}
                  </RadioGroup>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Message (facultatif)</Label>
                    <Textarea
                      placeholder={
                        audience === "client"
                          ? "Ajouter un mot pour le client..."
                          : "Ajouter un mot pour le(s) prestataire(s)..."
                      }
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onFocus={scrollOnFocus}
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>

                  {audience === "client" && requestType === "validation" && !document.file_url && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-destructive">
                        Aucun fichier attaché — ajoutez un fichier avant d&apos;envoyer pour
                        validation
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer fixe */}
      <div className="shrink-0 border-t px-4 py-4 bg-popover">
        <div className="max-w-lg mx-auto">
          {step === 1 ? (
            <Button className="w-full" onClick={goToStep2}>
              Continuer
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={goToStep1} className="flex-1 h-11">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button
                className="flex-1"
                onClick={handleSend}
                loading={loading}
                disabled={
                  loading ||
                  !canSend ||
                  (audience === "client" && requestType === "validation" && !document.file_url)
                }
              >
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
