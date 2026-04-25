"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ChevronRight, ChevronDown, Trash2 } from "lucide-react"
import { AddDocumentDialog } from "@/components/projects/add-document-dialog"
import { GenerateDocumentDialog } from "@/components/documents/GenerateDocumentDialog"
import { StaggerList, StaggerItem } from "@/components/ui/motion"
import { cn } from "@/lib/utils"
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
  created_at: string
}

interface ProjectDocumentsProps {
  documents: Document[]
  projectId: string
  projectName: string
  workType?: string
  clientName?: string
  selectedDocId: string | null
  onSelectDoc: (doc: Document) => void
  onDeleteDoc?: (docId: string) => void
  isOpen?: boolean
  onToggle?: () => void
  readOnly?: boolean
  highlightedId?: string | null
}

function DocItem({
  doc,
  isSelected,
  highlightedId,
  onSelectDoc,
  onDeleteDoc,
}: {
  doc: Document
  isSelected: boolean
  highlightedId?: string | null
  onSelectDoc: (doc: Document) => void
  onDeleteDoc?: (docId: string) => void
}) {
  const docStatus = docStatusMap[doc.status] ?? docStatusMap.draft

  return (
    <div data-doc-id={doc.id}>
      <Card
        onClick={() => onSelectDoc(doc)}
        className={cn(
          "cursor-pointer transition-all duration-500 hover:shadow-sm hover:bg-muted/50 group",
          isSelected && "border-primary",
          highlightedId === doc.id && "border-ring ring-3 ring-ring/50"
        )}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className={cn("h-2 w-2 rounded-full shrink-0", docStatus.dot)} />
          <div className="hidden sm:block bg-muted p-2 rounded-lg shrink-0">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="sm:hidden mb-2">
              <Badge variant={docStatus.variant} className={cn("text-xs", docStatus.className)}>
                {docStatus.label}
                {doc.version > 1 && ` · v${doc.version}`}
              </Badge>
            </div>
            <p className="text-sm font-medium truncate">{doc.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {doc.type} · {new Date(doc.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={docStatus.variant}
              className={cn("hidden sm:inline-flex text-xs", docStatus.className)}
            >
              {docStatus.label}
              {doc.version > 1 && ` · v${doc.version}`}
            </Badge>
            {/* Poubelle — desktop uniquement, visible au survol */}
            {onDeleteDoc && (
              <button
                aria-label="Supprimer le document"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteDoc(doc.id)
                }}
                className="hidden sm:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isSelected && "text-primary"
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ProjectDocuments({
  documents,
  projectId,
  projectName,
  workType,
  clientName,
  selectedDocId,
  onSelectDoc,
  onDeleteDoc,
  isOpen = true,
  onToggle,
  readOnly = false,
  highlightedId,
}: ProjectDocumentsProps) {
  useEffect(() => {
    if (!highlightedId) return
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-doc-id="${highlightedId}"]`)
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 300)
    return () => clearTimeout(t)
  }, [highlightedId])

  return (
    <>
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between group",
          isOpen && "mb-4",
          onToggle && "cursor-pointer"
        )}
        onClick={onToggle}
      >
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-md transition-colors",
            onToggle && "group-hover:bg-muted"
          )}
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              !isOpen && "-rotate-90"
            )}
          />
          <h2 className="font-semibold">Documents</h2>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {documents.length}
          </span>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1.5 pl-3" onClick={(e) => e.stopPropagation()}>
            <GenerateDocumentDialog
              projectId={projectId}
              projectName={projectName}
              workType={workType ?? ""}
              clientName={clientName}
            />
            <AddDocumentDialog projectId={projectId} />
          </div>
        )}
      </div>

      {/* Liste collapsible */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="docs-list"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-1">
              {documents.length > 0 ? (
                <StaggerList className="space-y-2">
                  {documents.map((doc) => (
                    <StaggerItem key={doc.id}>
                      <DocItem
                        doc={doc}
                        isSelected={selectedDocId === doc.id}
                        highlightedId={highlightedId}
                        onSelectDoc={onSelectDoc}
                        onDeleteDoc={!readOnly ? onDeleteDoc : undefined}
                      />
                    </StaggerItem>
                  ))}
                </StaggerList>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="font-medium text-sm">Aucun document</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ajoutez des documents à valider par votre client
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
