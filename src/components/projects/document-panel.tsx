"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileUpload } from "@/components/projects/file-upload"
import { FileViewer } from "@/components/projects/file-viewer"
import { DocumentThread } from "@/components/projects/document-thread"
import { DocumentActions } from "@/components/projects/document-actions"
import { FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

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
  authorName: string
  onClose: () => void
}

const docStatusMap: Record<
  string,
  {
    label: string
    variant: "default" | "secondary" | "outline" | "destructive"
    className?: string
  }
> = {
  draft: { label: "Brouillon", variant: "outline" },
  sent: { label: "Envoyé", variant: "secondary" },
  approved: {
    label: "Approuvé ✓",
    variant: "outline",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  rejected: {
    label: "Refusé",
    variant: "outline",
    className: "bg-red-50 text-red-600 border-red-200",
  },
}

export function DocumentPanel({ document, userId, authorName, onClose }: DocumentPanelProps) {
  const [localFileUrl, setLocalFileUrl] = useState<string | null>(null)

  const docStatus = docStatusMap[document.status] ?? docStatusMap.draft
  const fileUrl = localFileUrl ?? document.file_url

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between gap-3 shrink-0">
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
            {docStatus.label}
            {document.version > 1 && ` · v${document.version}`}
          </Badge>
          <DocumentActions doc={document} />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Section fichier */}
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Fichier
          </p>
          {fileUrl ? (
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

        <Separator />

        {/* Section discussion */}
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Discussion
          </p>
          <DocumentThread documentId={document.id} authorName={authorName} authorRole="pro" />
        </div>
      </div>
    </div>
  )
}
