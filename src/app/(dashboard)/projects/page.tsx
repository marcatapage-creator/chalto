import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, Plus } from "lucide-react"
import Link from "next/link"
import { FadeIn, StaggerList, StaggerItem, HoverCard } from "@/components/ui/motion"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  active: { label: "En cours", variant: "default" },
  completed: { label: "Terminé", variant: "secondary" },
  archived: { label: "Archivé", variant: "outline" },
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <FadeIn className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
            <p className="text-muted-foreground">Gérez vos projets et vos clients</p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau projet
            </Link>
          </Button>
        </FadeIn>

        {projects && projects.length > 0 ? (
          <StaggerList className="space-y-3">
            {projects.map((project) => {
              const status = statusMap[project.status] ?? statusMap.draft
              return (
                <StaggerItem key={project.id}>
                  <HoverCard>
                    <Link href={`/projects/${project.id}`}>
                      <Card className="hover:border-primary transition-colors duration-200 cursor-pointer">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-muted p-2 rounded-lg">
                              <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{project.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {project.client_name || "Pas de client"}
                                {project.address && ` · ${project.address}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-xs text-muted-foreground hidden sm:block">
                              {new Date(project.created_at).toLocaleDateString("fr-FR")}
                            </p>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </HoverCard>
                </StaggerItem>
              )
            })}
          </StaggerList>
        ) : (
          <FadeIn delay={0.1}>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="font-medium">Aucun projet pour l&apos;instant</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Créez votre premier projet pour commencer
                </p>
                <Button asChild>
                  <Link href="/projects/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un projet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
