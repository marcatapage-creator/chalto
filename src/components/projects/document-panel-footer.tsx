import { Button } from "@/components/ui/button"
import { DocumentActions } from "@/components/projects/document-actions"
import { Clock, Link2, RotateCcw, RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { AudienceInfo } from "./document-panel-types"

interface DocumentPanelFooterProps {
  localStatus: string
  isChantier: boolean
  fileUrl?: string | null
  proposing: boolean
  documentId: string
  documentName: string
  projectId: string
  clientName?: string
  localVersion: number
  audienceInfo: AudienceInfo
  cloudFileId?: string | null
  onProposeV2: () => void
  onCopyLink: () => void
  onResynced?: (version: number, fileUrl: string) => void
  onOpenSend?: () => void
}

export function DocumentPanelFooter({
  localStatus,
  isChantier,
  fileUrl,
  proposing,
  documentId,
  documentName,
  projectId,
  clientName,
  localVersion,
  audienceInfo,
  cloudFileId,
  onProposeV2,
  onCopyLink,
  onResynced,
  onOpenSend,
}: DocumentPanelFooterProps) {
  const [resyncing, setResyncing] = useState(false)

  const handleResync = async () => {
    setResyncing(true)
    try {
      const res = await fetch("/api/dropbox/resync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        toast.error(data.error ?? "Erreur lors de la resynchronisation")
        return
      }
      const data = (await res.json()) as { version: number; fileUrl: string }
      toast.success(`V${data.version} synchronisée depuis Dropbox`)
      onResynced?.(data.version, data.fileUrl)
    } finally {
      setResyncing(false)
    }
  }

  if (localStatus === "draft") {
    return (
      <div className="shrink-0 border-t px-4 py-4 space-y-3 bg-popover">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Envoyer pour validation ou transmission
        </p>
        <DocumentActions
          documentId={documentId}
          documentName={documentName}
          projectId={projectId}
          status={localStatus}
          fileUrl={fileUrl}
          isChantier={isChantier}
          className="w-full"
          onOpenSend={onOpenSend}
        />
      </div>
    )
  }

  if (localStatus === "commented") {
    return (
      <div className="shrink-0 border-t px-4 py-4 space-y-3 bg-popover">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {isChantier ? "Partager avec l’équipe" : "Envoyer pour validation"}
        </p>
        <DocumentActions
          documentId={documentId}
          documentName={documentName}
          projectId={projectId}
          clientName={clientName}
          status={localStatus}
          fileUrl={fileUrl}
          isChantier={isChantier}
          className="w-full"
          onOpenSend={onOpenSend}
        />
      </div>
    )
  }

  if (localStatus === "approved" && isChantier) {
    return (
      <div className="shrink-0 border-t px-4 py-4 space-y-3 bg-popover">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Partager avec l&apos;équipe
        </p>
        <DocumentActions
          documentId={documentId}
          documentName={documentName}
          projectId={projectId}
          status={localStatus}
          fileUrl={fileUrl}
          isChantier={isChantier}
          className="w-full"
          onOpenSend={onOpenSend}
        />
      </div>
    )
  }

  if (localStatus === "sent") {
    return (
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
        <Button variant="outline" size="sm" className="w-full" onClick={onCopyLink}>
          <Link2 className="h-4 w-4 mr-2" />
          Copier le lien
        </Button>
      </div>
    )
  }

  if (localStatus === "rejected") {
    return (
      <div className="shrink-0 border-t px-4 py-4 space-y-3 bg-popover">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Suite à donner
        </p>
        {cloudFileId ? (
          <Button variant="outline" className="w-full" onClick={handleResync} loading={resyncing}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {resyncing ? "Synchronisation..." : "Resynchroniser depuis Dropbox"}
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={onProposeV2} loading={proposing}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {proposing ? "Création..." : `Proposer une V${localVersion + 1}`}
          </Button>
        )}
      </div>
    )
  }

  return null
}
