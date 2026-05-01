import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DocumentActions } from "@/components/projects/document-actions"
import { Send, Clock, Link2, RotateCcw } from "lucide-react"
import type { AudienceInfo } from "./document-panel-types"

interface DocumentPanelFooterProps {
  localStatus: string
  isChantier: boolean
  fileUrl: string | null | undefined
  message: string
  onMessageChange: (msg: string) => void
  sending: boolean
  proposing: boolean
  documentId: string
  documentName: string
  projectId: string
  clientName?: string
  localVersion: number
  audienceInfo: AudienceInfo
  onSent: () => void
  onSend: () => void
  onProposeV2: () => void
  onCopyLink: () => void
}

export function DocumentPanelFooter({
  localStatus,
  isChantier,
  fileUrl,
  message,
  onMessageChange,
  sending,
  proposing,
  documentId,
  documentName,
  projectId,
  clientName,
  localVersion,
  audienceInfo,
  onSent,
  onSend,
  onProposeV2,
  onCopyLink,
}: DocumentPanelFooterProps) {
  if (localStatus === "draft") {
    return (
      <div className="shrink-0 border-t px-4 py-4 space-y-3 bg-popover">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {isChantier ? "Envoyer pour validation ou transmission" : "Envoyer pour validation"}
        </p>
        {!isChantier && (
          <Textarea
            placeholder="Ajouter un mot pour le client (facultatif)..."
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={2}
            className="resize-none text-sm"
          />
        )}
        {isChantier ? (
          <DocumentActions
            documentId={documentId}
            documentName={documentName}
            projectId={projectId}
            clientName={clientName}
            status={localStatus}
            className="w-full"
            onSent={onSent}
          />
        ) : (
          <Button onClick={onSend} disabled={!fileUrl} loading={sending} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Envoi..." : "Envoyer au client"}
          </Button>
        )}
      </div>
    )
  }

  if ((localStatus === "approved" || localStatus === "commented") && isChantier) {
    return (
      <div className="shrink-0 border-t px-4 py-4 space-y-3 bg-popover">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Partager avec un prestataire
        </p>
        <DocumentActions
          documentId={documentId}
          documentName={documentName}
          projectId={projectId}
          clientName={clientName}
          status={localStatus}
          className="w-full"
          onSent={() => {}}
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
        {!audienceInfo.requestType && (
          <Button variant="outline" size="sm" className="w-full" onClick={onCopyLink}>
            <Link2 className="h-4 w-4 mr-2" />
            Copier le lien de validation
          </Button>
        )}
      </div>
    )
  }

  if (localStatus === "rejected") {
    return (
      <div className="shrink-0 border-t px-4 py-4 space-y-3 bg-popover">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Suite à donner
        </p>
        <Button variant="outline" className="w-full" onClick={onProposeV2} loading={proposing}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {proposing ? "Création..." : `Proposer une V${localVersion + 1}`}
        </Button>
      </div>
    )
  }

  return null
}
