import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/queries"
import { getCachedProfile } from "@/lib/cached-queries"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const profile = await getCachedProfile(user.id)

  const sidebarProfile = {
    id: user.id,
    full_name: profile?.full_name,
    email: profile?.email ?? user.email,
    plan: (profile?.plan ?? "free") as string,
  }

  return (
    <div className="flex h-dvh bg-background">
      <Sidebar
        profile={sidebarProfile}
        counts={{ projects: 0, contacts: 0, deadlines: 0 }}
        userId={user.id}
      />
      <main className="flex-1 flex flex-col overflow-hidden xl:ml-0 bg-neutral-50 dark:bg-transparent">
        {/* Spacer mobile pour le header fixe */}
        <div className="xl:hidden h-18.5 shrink-0" />
        {children}
      </main>
    </div>
  )
}
