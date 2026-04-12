import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, FileText, CheckCircle, Clock } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user!.id)

  const { data: documents } = await supabase
    .from("documents")
    .select("*, projects!inner(user_id)")
    .eq("projects.user_id", user!.id)

  const stats = [
    {
      label: "Projets actifs",
      value: projects?.filter(p => p.status === "active").length ?? 0,
      icon: FolderOpen,
      description: "En cours"
    },
    {
      label: "Documents",
      value: documents?.length ?? 0,
      icon: FileText,
      description: "Total"
    },
    {
      label: "Validations reçues",
      value: documents?.filter(d => d.status === "approved").length ?? 0,
      icon: CheckCircle,
      description: "Approuvés"
    },
    {
      label: "En attente",
      value: documents?.filter(d => d.status === "sent").length ?? 0,
      icon: Clock,
      description: "Envoyés"
    },
  ]

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre activité
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Projets récents */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Projets récents</h2>
          {projects && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <Card key={project.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.client_name || "Pas de client"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      project.status === "active" ? "default" :
                      project.status === "completed" ? "secondary" : "outline"
                    }>
                      {project.status === "active" ? "En cours" :
                       project.status === "completed" ? "Terminé" :
                       project.status === "draft" ? "Brouillon" : project.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="font-medium">Aucun projet pour l'instant</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Créez votre premier projet pour commencer
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
