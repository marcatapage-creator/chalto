import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, MapPin, Mail, FileText } from "lucide-react"
import Link from "next/link"
import { AddDocumentDialog } from "@/components/projects/add-document-dialog"
import { DocumentActions } from "@/components/projects/document-actions"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  active: { label: "En cours", variant: "default" },
  completed: { label: "Terminé", variant: "secondary" },
  archived: { label: "Archivé", variant: "outline" },
}

const docStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  sent: { label: "Envoyé", variant: "secondary" },
  approved: { label: "Approuvé ✓", variant: "default" },
  rejected: { label: "Refusé", variant: "destructive" },
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single()

  if (!project) notFound()

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })

  const status = statusMap[project.status] ?? statusMap.draft

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Créé le {new Date(project.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Infos client */}
          <div className="col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informations client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.client_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{project.client_name}</span>
                  </div>
                )}
                {project.client_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{project.client_email}</span>
                  </div>
                )}
                {project.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{project.address}</span>
                  </div>
                )}
                {!project.client_name && !project.client_email && !project.address && (
                  <p className="text-sm text-muted-foreground">Aucune information client</p>
                )}
              </CardContent>
            </Card>

            {project.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Documents */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Documents</h2>
              <AddDocumentDialog projectId={id} />
            </div>

            {documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const docStatus = docStatusMap[doc.status] ?? docStatusMap.draft
                  return (
                    <Card key={doc.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={docStatus.variant}>
                            {docStatus.label}
                          </Badge>
                          <DocumentActions doc={doc} />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
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
        </div>
      </div>
    </div>
  )
}
