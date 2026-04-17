import { unstable_cache } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, Plus } from "lucide-react"
import Link from "next/link"
import { FadeIn, StaggerList, StaggerItem } from "@/components/ui/motion"
import { DeleteProjectButton } from "@/components/projects/delete-project-button"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  active: { label: "En cours", variant: "default" },
  completed: { label: "Terminé", variant: "secondary" },
  archived: { label: "Archivé", variant: "outline" },
}

const phaseMap: Record<string, string> = {
  cadrage: "Cadrage",
  conception: "Conception",
  validation: "Validation",
  chantier: "Chantier",
  reception: "Réception",
  cloture: "Clôturé",
}

const getProjects = unstable_cache(
  async (userId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    return data ?? []
  },
  ["projects"],
  { revalidate: 30 }
)

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const projects = await getProjects(user!.id)

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
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nouveau projet</span>
            </Link>
          </Button>
        </FadeIn>

        {projects.length > 0 ? (
          <StaggerList className="space-y-3">
            {projects.map((project) => {
              const status = statusMap[project.status] ?? statusMap.draft
              const phase = phaseMap[project.phase ?? "cadrage"] ?? "Cadrage"
              return (
                <StaggerItem key={project.id}>
                  <Link href={`/projects/${project.id}`}>
                    <Card className="cursor-pointer transition-all duration-150 hover:shadow-sm hover:bg-muted/50">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:block bg-muted p-2 rounded-lg">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="sm:hidden mb-0.5">
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
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
                          <span className="hidden sm:inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {phase}
                          </span>
                          <Badge variant={status.variant} className="hidden sm:inline-flex">
                            {status.label}
                          </Badge>
                          <DeleteProjectButton projectId={project.id} projectName={project.name} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
