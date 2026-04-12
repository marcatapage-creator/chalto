import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <p className="text-muted-foreground mt-2">Connecté en tant que {user.email}</p>
    </div>
  )
}
