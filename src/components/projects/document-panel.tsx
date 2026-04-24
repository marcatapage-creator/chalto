"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/projects/file-upload"
import { FileViewer } from "@/components/projects/file-viewer"
import { DocumentActions } from "@/components/projects/document-actions"
import { createClient } from "@/lib/supabase/client"
import { haptics } from "@/lib/haptics"
import { analytics } from "@/lib/analytics"
import {
  FileText,
  X,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  Clock,
  Link2,
  RotateCcw,
} from "lucide-react"
import { cn, isChantierPhase } from "@/lib/utils"
import { toast } from "sonner"
import { docStatusMap } from "@/lib/doc-status"

interface Document {
  id: string
  name: string
  type: string
  status: string
  version: number
  validation_token: string
  project_id: string
  file_url?: string
  file_name?: string
  file_type?: string
  file_size?: number
}

interface DocumentPanelProps {
  document: Document
  userId: string
  clientName?: string
  phase?: string
  onClose: () => void
  showClose?: boolean
  onStatusChange?: (docId: string, status: string, version?: number) => void
}

interface PrevVersion {
  version: number
  file_url: string | null
  file_name?: string
  file_type?: string
}

export function DocumentPanel({
  document,
  userId,
  clientName,
  phase,
  onClose,
  showClose,
  onStatusChange,
}: DocumentPanelProps) {
  const isChantier = isChantierPhase(phase)
  const [localStatus, setLocalStatus] = useState(document.status)
  const [localVersion, setLocalVersion] = useState(document.version ?? 1)
  // undefined = unset (fall through to document.file_url); null = explicitly cleared; string = uploaded URL
  const [localFileUrl, setLocalFileUrl] = useState<string | null | undefined>(undefined)
  const [prevVersions, setPrevVersions] = useState<PrevVersion[]>([])
  const [activeVersionTab, setActiveVersionTab] = useState<number | null>(() => {
    if (typeof window === "undefined") return null
    const saved = localStorage.getItem(`doc_version_${document.id}`)
    return saved !== null ? Number(saved) : null
  })
  const onStatusChangeRef = useRef(onStatusChange)
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  const [validationEntry, setValidationEntry] = useState<{
    docId: string
    data: { status: string; comment?: string; approved_at?: string; client_name?: string } | null
  }>({ docId: document.id, data: null })
  const [audienceInfo, setAudienceInfo] = useState<{
    requestType: "validation" | "transmission" | null
    names: string[]
  }>({ requestType: null, names: [] })
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [proposing, setProposing] = useState(false)

  const handleVersionTabChange = useCallback(
    (version: number | null) => {
      setActiveVersionTab(version)
      if (version === null) {
        localStorage.removeItem(`doc_version_${document.id}`)
      } else {
        localStorage.setItem(`doc_version_${document.id}`, String(version))
      }
    },
    [document.id]
  )

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase
      .from("document_versions")
      .select("version, file_url, file_name")
      .eq("document_id", document.id)
      .order("version", { ascending: false })
      .then(({ data }) => {
        if (data) setPrevVersions(data)
      })
  }, [document.id, supabase])

  const validation = validationEntry.docId === document.id ? validationEntry.data : null
  const docStatus = docStatusMap[localStatus] ?? docStatusMap.draft
  const fileUrl = localFileUrl === undefined ? document.file_url : localFileUrl

  useEffect(() => {
    supabase
      .from("validations")
      .select("status, comment, approved_at, client_name")
      .eq("document_id", document.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setValidationEntry({ docId: document.id, data: data ?? null })
        // "approved"/"rejected" on a "sent" or "draft" doc belong to a previous version — skip.
        // "commented" (transmission) is always current: it can only appear after the current send.
        const isLegacy =
          document.status === "draft" ||
          (document.status === "sent" && data?.status !== "commented")
        if (data?.status && !isLegacy) {
          setLocalStatus(data.status)
          onStatusChangeRef.current?.(document.id, data.status)
        }
      })
  }, [document.id, document.status, supabase])

  const fetchValidation = useCallback(async () => {
    const { data } = await supabase
      .from("validations")
      .select("status, comment, approved_at, client_name")
      .eq("document_id", document.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) {
      setValidationEntry({ docId: document.id, data })
      setLocalStatus(data.status)
      onStatusChangeRef.current?.(document.id, data.status)
    }
  }, [document.id, supabase])

  useEffect(() => {
    if (localStatus !== "sent") return
    supabase
      .from("document_contributors")
      .select("request_type, contributor_id")
      .eq("document_id", document.id)
      .then(async ({ data: dcData, error }) => {
        if (error || !dcData?.length) return
        const reqType = (dcData[0].request_type as "validation" | "transmission") ?? "validation"
        const ids = dcData.map((d) => d.contributor_id)
        const { data: contribs } = await supabase.from("contributors").select("name").in("id", ids)
        setAudienceInfo({
          requestType: reqType,
          names: contribs?.map((c) => c.name) ?? [],
        })
      })
  }, [document.id, localStatus, supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`document-watch:${document.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
          filter: `id=eq.${document.id}`,
        },
        (payload) => {
          const updated = payload.new as { status: string }
          setLocalStatus(updated.status)
          onStatusChangeRef.current?.(document.id, updated.status)
          if (updated.status !== "draft" && updated.status !== "sent") {
            void fetchValidation()
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "validations" },
        (payload) => {
          const v = payload.new as { document_id: string }
          if (v.document_id === document.id) void fetchValidation()
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [document.id, fetchValidation, supabase])

  const handleSend = async () => {
    setSending(true)
    const res = await fetch("/api/send-validation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: document.id, message: message || null }),
    })
    const data = await res.json()
    if (res.ok) {
      haptics.success()
      analytics.documentSent()
      toast.success("Email de validation envoyé au client ✅")
      setMessage("")
      setLocalStatus("sent")
      onStatusChange?.(document.id, "sent")
    } else if (data.error === "Erreur mise à jour document") {
      toast.error("Erreur lors de la mise à jour du document")
    } else if (data.error === "Pas d'email client") {
      toast.error("Ajoutez l'email du client dans le projet")
    } else {
      toast.error("Erreur lors de l'envoi")
    }
    setSending(false)
  }

  const handleProposeV2 = async () => {
    setProposing(true)
    const newVersion = localVersion + 1
    const newToken = crypto.randomUUID()

    const [, { error }] = await Promise.all([
      supabase.from("document_versions").insert({
        document_id: document.id,
        version: localVersion,
        file_url: fileUrl ?? null,
        file_name: document.file_name ?? null,
        file_type: document.file_type ?? null,
        file_size: document.file_size ?? null,
      }),
      supabase
        .from("documents")
        .update({
          status: "draft",
          version: newVersion,
          file_url: null,
          file_name: null,
          file_type: null,
          file_size: null,
          validation_token: newToken,
        })
        .eq("id", document.id),
    ])

    if (error) {
      console.error("[proposeV2]", error)
      toast.error("Erreur lors de la création de la nouvelle version")
      setProposing(false)
      return
    }

    setPrevVersions((prev) =>
      [
        {
          version: localVersion,
          file_url: fileUrl ?? null,
          file_name: document.file_name,
          file_type: document.file_type,
        },
        ...prev,
      ].slice(0, 3)
    )
    setLocalVersion(newVersion)
    setLocalStatus("draft")
    setLocalFileUrl(null)
    handleVersionTabChange(null)
    onStatusChange?.(document.id, "draft", newVersion)

    setProposing(false)
    toast.success(`Version ${newVersion} créée — uploadez le nouveau fichier`)
  }

  const handleCopyLink = () => {
    const validationUrl = `${window.location.origin}/validate/${document.validation_token}`
    navigator.clipboard.writeText(validationUrl)
    toast.success("Lien copié dans le presse-papiers")
  }

  const activePrev =
    activeVersionTab !== null
      ? (prevVersions.find((p) => p.version === activeVersionTab) ?? null)
      : null

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 border-b flex items-center justify-between gap-3 shrink-0 min-h-25.25">
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-muted p-1.5 rounded-md shrink-0">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{document.name}</p>
            <p className="text-xs text-muted-foreground">{document.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={docStatus.variant} className={cn("text-xs", docStatus.className)}>
            {localVersion > 1
              ? `V${localVersion} ${docStatus.label.toLowerCase()}`
              : docStatus.label}
          </Badge>
          {showClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Résultat validation */}
      {validation && localStatus !== "sent" && localStatus !== "draft" && (
        <div className="px-4 py-3 border-b shrink-0">
          {validation.status === "commented" ? (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <MessageSquare className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Commenté par {validation.client_name ?? "le prestataire"}
                </p>
                {validation.comment && (
                  <p className="text-sm text-muted-foreground italic">{`"${validation.comment}"`}</p>
                )}
                {validation.approved_at && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(validation.approved_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                validation.status === "approved" ? "bg-primary/10" : "bg-destructive/10"
              )}
            >
              {validation.status === "approved" ? (
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {validation.status === "approved"
                    ? `Approuvé par ${validation.client_name ?? "le client"}`
                    : `Refusé par ${validation.client_name ?? "le client"}`}
                </p>
                {validation.comment && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground italic">{`"${validation.comment}"`}</p>
                  </div>
                )}
                {validation.approved_at && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(validation.approved_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Fichier
          </p>

          {prevVersions.length > 0 && (
            <div className="flex text-xs border rounded-lg overflow-hidden">
              <button
                onClick={() => handleVersionTabChange(null)}
                className={cn(
                  "flex-1 px-3 py-1.5 transition-colors",
                  activeVersionTab === null
                    ? "bg-background font-medium"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                V{localVersion} · En cours
              </button>
              {prevVersions.map((pv) => (
                <button
                  key={pv.version}
                  onClick={() => handleVersionTabChange(pv.version)}
                  className={cn(
                    "flex-1 px-3 py-1.5 transition-colors border-l",
                    activeVersionTab === pv.version
                      ? "bg-background font-medium"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  V{pv.version}
                </button>
              ))}
            </div>
          )}

          {activePrev ? (
            activePrev.file_url ? (
              <FileViewer
                fileUrl={activePrev.file_url}
                fileName={activePrev.file_name ?? document.name}
                fileType={activePrev.file_type ?? "application/pdf"}
              />
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground border rounded-lg border-dashed">
                Aucun fichier pour la V{activeVersionTab}
              </div>
            )
          ) : fileUrl ? (
            <FileViewer
              fileUrl={fileUrl}
              fileName={document.file_name ?? document.name}
              fileType={document.file_type ?? "application/pdf"}
            />
          ) : (
            <FileUpload
              documentId={document.id}
              userId={userId}
              onSuccess={(url) => setLocalFileUrl(url)}
            />
          )}
        </div>
      </div>

      {/* Footer sticky — actions */}
      {localStatus === "draft" && (
        <div className="shrink-0 border-t px-4 py-4 space-y-3 bg-popover">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {isChantier ? "Envoyer pour validation ou transmission" : "Envoyer pour validation"}
          </p>
          {!isChantier && (
            <Textarea
              placeholder="Ajouter un mot pour le client (facultatif)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          )}
          {isChantier ? (
            <DocumentActions
              documentId={document.id}
              documentName={document.name}
              projectId={document.project_id}
              clientName={clientName}
              status={localStatus}
              className="w-full"
              onSent={() => {
                setLocalStatus("sent")
                onStatusChange?.(document.id, "sent")
              }}
            />
          ) : (
            <Button onClick={handleSend} disabled={!fileUrl} loading={sending} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Envoi..." : "Envoyer au client"}
            </Button>
          )}
        </div>
      )}

      {localStatus === "sent" && (
        <div className="shrink-0 border-t px-4 py-4 space-y-3 bg-popover">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {audienceInfo.requestType === "transmission" ? "Transmission" : "Validation"}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {audienceInfo.requestType === "transmission"
                ? `En attente de lecture de ${audienceInfo.names.join(", ") || "du destinataire"}`
                : audienceInfo.names.length > 0
                  ? `En attente de validation de ${audienceInfo.names.join(", ")}`
                  : `En attente de réponse de ${clientName ?? "du client"}`}
            </span>
          </div>
          {!audienceInfo.requestType && (
            <Button variant="outline" size="sm" className="w-full" onClick={handleCopyLink}>
              <Link2 className="h-4 w-4 mr-2" />
              Copier le lien de validation
            </Button>
          )}
        </div>
      )}

      {localStatus === "rejected" && (
        <div className="shrink-0 border-t px-4 py-4 space-y-3 bg-popover">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Suite à donner
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleProposeV2}
            loading={proposing}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {proposing ? "Création..." : `Proposer une V${localVersion + 1}`}
          </Button>
        </div>
      )}
    </div>
  )
}
