import { createClient } from "@/lib/supabase/server"
import { DOCUMENT_STATUS } from "@/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { FadeIn } from "@/components/ui/motion"
import { ProjectsListClient } from "@/components/projects/projects-list-client"
import type { ProjectWithCounts } from "@/components/projects/projects-list-client"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
  const allProjects = data ?? []

  const projectIds = allProjects.map((p) => p.id)

  const [{ data: docRows }, { data: taskRows }, { data: contributorRows }, { data: msgRows }] =
    projectIds.length > 0
      ? await Promise.all([
          supabase.from("documents").select("project_id, status").in("project_id", projectIds),
          supabase.from("tasks").select("project_id, status").in("project_id", projectIds),
          supabase.from("contributors").select("project_id").in("project_id", projectIds),
          supabase.from("project_messages").select("project_id").in("project_id", projectIds),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }]

  const projects: ProjectWithCounts[] = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
    client_name: p.client_name,
    address: p.address,
    status: p.status,
    phase: p.phase,
    created_at: p.created_at,
    counts: {
      docs: docRows?.filter((d) => d.project_id === p.id).length ?? 0,
      pending:
        docRows?.filter((d) => d.project_id === p.id && d.status === DOCUMENT_STATUS.SENT).length ??
        0,
      approved:
        docRows?.filter((d) => d.project_id === p.id && d.status === DOCUMENT_STATUS.APPROVED)
          .length ?? 0,
      tasks:
        taskRows?.filter((t) => t.project_id === p.id && ["todo", "in_progress"].includes(t.status))
          .length ?? 0,
      messages: msgRows?.filter((m) => m.project_id === p.id).length ?? 0,
      contributors: contributorRows?.filter((c) => c.project_id === p.id).length ?? 0,
    },
  }))

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

        <ProjectsListClient projects={projects} />
      </div>
    </div>
  )
}
