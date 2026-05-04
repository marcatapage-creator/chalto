import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { getCachedProfile } from "@/lib/cached-queries"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const supabase = await createClient()
  const [profile, { count: projectsCount }, { count: contactsCount }] = await Promise.all([
    getCachedProfile(user.id),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ])

  const sidebarProfile = {
    id: user.id,
    full_name: profile?.full_name,
    email: profile?.email,
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        profile={sidebarProfile}
        counts={{ projects: projectsCount ?? 0, contacts: contactsCount ?? 0 }}
        userId={user.id}
      />
      <main className="flex-1 flex flex-col overflow-hidden xl:ml-0 bg-neutral-50 dark:bg-transparent">
        {/* Spacer mobile pour le header fixe */}
        <div className="xl:hidden h-14 shrink-0" />
        {children}
      </main>
    </div>
  )
}
