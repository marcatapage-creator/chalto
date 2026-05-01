import { createClient } from "@/lib/supabase/server"
import { AlertTriangle, FileText, ListTodo } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { FadeIn } from "@/components/ui/motion"

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

export async function DashboardUrgences({ projectIds }: { projectIds: string[] }) {
  if (projectIds.length === 0) return null

  const supabase = await createClient()
  // eslint-disable-next-line react-hooks/purity
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  const today = new Date().toISOString().split("T")[0]

  const [{ data: pendingDocs }, { data: overdueTasks }] = await Promise.all([
    supabase
      .from("documents")
      .select("id, name, updated_at, project_id, projects(name)")
      .eq("status", "sent")
      .lt("updated_at", fiveDaysAgo)
      .in("project_id", projectIds)
      .order("updated_at", { ascending: true })
      .limit(5),
    supabase
      .from("tasks")
      .select("id, title, due_date, project_id, projects(name)")
      .in("status", ["todo", "in_progress"])
      .lt("due_date", today)
      .in("project_id", projectIds)
      .order("due_date", { ascending: true })
      .limit(5),
  ])

  if (!pendingDocs?.length && !overdueTasks?.length) return null

  return (
    <FadeIn delay={0.1}>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />À traiter
      </h2>
      <Card className="overflow-hidden py-0">
        <CardContent className="p-0 divide-y">
          {pendingDocs?.map((doc) => {
            const projectName = (doc.projects as unknown as { name: string } | null)?.name
            const days = daysSince(doc.updated_at!)
            return (
              <Link
                key={doc.id}
                href={`/projects/${doc.project_id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{projectName}</p>
                  </div>
                </div>
                <span className="text-xs text-amber-600 font-medium shrink-0 ml-4 whitespace-nowrap">
                  {days}j sans réponse
                </span>
              </Link>
            )
          })}
          {overdueTasks?.map((task) => {
            const projectName = (task.projects as unknown as { name: string } | null)?.name
            const days = daysSince(task.due_date!)
            return (
              <Link
                key={task.id}
                href={`/projects/${task.project_id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ListTodo className="h-4 w-4 text-red-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{projectName}</p>
                  </div>
                </div>
                <span className="text-xs text-red-600 font-medium shrink-0 ml-4 whitespace-nowrap">
                  +{days}j de retard
                </span>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
