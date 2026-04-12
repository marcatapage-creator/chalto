"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ChevronRight } from "lucide-react"
import { AddDocumentDialog } from "@/components/projects/add-document-dialog"
import { StaggerList, StaggerItem, HoverCard } from "@/components/ui/motion"
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
  created_at: string
}

interface ProjectDocumentsProps {
  documents: Document[]
  projectId: string
  userId: string
  authorName: string
  selectedDocId: string | null
  onSelectDoc: (doc: Document) => void
}

const docStatusMap: Record<
  string,
  {
    label: string
    variant: "default" | "secondary" | "outline" | "destructive"
    className?: string
    dot: string
  }
> = {
  draft: { label: "Brouillon", variant: "outline", dot: "bg-muted-foreground" },
  sent: { label: "Envoyé", variant: "secondary", dot: "bg-blue-400" },
  approved: {
    label: "Approuvé",
    variant: "outline",
    className: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Refusé",
    variant: "outline",
    className: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
}

export function ProjectDocuments({
  documents,
  projectId,
  selectedDocId,
  onSelectDoc,
}: ProjectDocumentsProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">
          Documents
          {documents.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({documents.length})
            </span>
          )}
        </h2>
        <AddDocumentDialog projectId={projectId} />
      </div>

      {/* Liste */}
      {documents.length > 0 ? (
        <StaggerList className="space-y-2">
          {documents.map((doc) => {
            const docStatus = docStatusMap[doc.status] ?? docStatusMap.draft
            const isSelected = selectedDocId === doc.id

            return (
              <StaggerItem key={doc.id}>
                <HoverCard onClick={() => onSelectDoc(doc)}>
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      isSelected && "border-primary"
                    )}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className={cn("h-2 w-2 rounded-full shrink-0", docStatus.dot)} />
                      <div className="bg-muted p-2 rounded-lg shrink-0">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {doc.type} · {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={docStatus.variant}
                          className={cn("text-xs", docStatus.className)}
                        >
                          {docStatus.label}
                          {doc.version > 1 && ` · v${doc.version}`}
                        </Badge>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isSelected && "text-primary"
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </HoverCard>
              </StaggerItem>
            )
          })}
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
    </>
  )
}
