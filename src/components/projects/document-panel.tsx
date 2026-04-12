"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileUpload } from "@/components/projects/file-upload"
import { FileViewer } from "@/components/projects/file-viewer"
import { DocumentThread } from "@/components/projects/document-thread"
import { DocumentActions } from "@/components/projects/document-actions"
import { createClient } from "@/lib/supabase/client"
import { FileText, X, CheckCircle, XCircle, MessageSquare } from "lucide-react"
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
  const [validationEntry, setValidationEntry] = useState<{
    docId: string
    data: { status: string; comment?: string; approved_at?: string } | null
  }>({ docId: document.id, data: null })

  // Derive current validation — null while a new fetch is in-flight (docId mismatch)
  const validation = validationEntry.docId === document.id ? validationEntry.data : null

  const docStatus = docStatusMap[document.status] ?? docStatusMap.draft
  const fileUrl = localFileUrl ?? document.file_url

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("validations")
      .select("status, comment, approved_at")
      .eq("document_id", document.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setValidationEntry({ docId: document.id, data: data ?? null })
      })
  }, [document.id])

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

      {/* Résultat validation */}
      {validation && (
        <div className="px-4 py-3 border-b shrink-0">
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
                  ? "Approuvé par le client"
                  : "Refusé par le client"}
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
        </div>
      )}

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
