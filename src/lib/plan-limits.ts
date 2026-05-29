import type { SupabaseClient } from "@supabase/supabase-js"
import { PLAN_LIMITS, type Plan } from "@/types/index"

export async function getUserPlan(supabase: SupabaseClient, userId: string): Promise<Plan> {
  const { data } = await supabase.from("profiles").select("plan").eq("id", userId).single()
  return (data?.plan as Plan) ?? "free"
}

export async function getActiveProjectCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active")
  return count ?? 0
}

export async function getMonthlyAiDocCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const { count } = await supabase
    .from("documents")
    .select("id, projects!inner(user_id)", { count: "exact", head: true })
    .eq("projects.user_id", userId)
    .eq("ai_generated", true)
    .gte("created_at", startOfMonth.toISOString())

  return count ?? 0
}

export function canCreateProject(plan: Plan, currentActiveProjects: number): boolean {
  return currentActiveProjects < PLAN_LIMITS[plan].maxActiveProjects
}

export function canGenerateAiDoc(plan: Plan, monthlyAiDocs: number): boolean {
  return monthlyAiDocs < PLAN_LIMITS[plan].maxAiDocsPerMonth
}
