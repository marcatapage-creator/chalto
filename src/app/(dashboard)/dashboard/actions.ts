"use server"

import { createClient } from "@/lib/supabase/server"

export async function fetchDashboardCounts(userId: string) {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from("projects")
    .select("id, status")
    .eq("user_id", userId)

  const projectIds = projects?.map((p) => p.id) ?? []

  const { data: documents } =
    projectIds.length > 0
      ? await supabase.from("documents").select("status").in("project_id", projectIds)
      : { data: [] }

  return {
    activeProjects: projects?.filter((p) => p.status === "active").length ?? 0,
    totalDocs: documents?.length ?? 0,
    approved: documents?.filter((d) => d.status === "approved").length ?? 0,
    pending: documents?.filter((d) => d.status === "sent").length ?? 0,
  }
}
