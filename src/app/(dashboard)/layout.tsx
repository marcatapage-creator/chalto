import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const [{ data: profile }, { count: projectsCount }, { count: contactsCount }] = await Promise.all(
    [
      supabase.from("profiles").select("*, professions(label, icon)").eq("id", user.id).single(),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        profile={profile}
        counts={{ projects: projectsCount ?? 0, contacts: contactsCount ?? 0 }}
        userId={user.id}
      />
      <main className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Spacer mobile pour le header fixe */}
        <div className="md:hidden h-14 shrink-0" />
        {children}
      </main>
    </div>
  )
}
