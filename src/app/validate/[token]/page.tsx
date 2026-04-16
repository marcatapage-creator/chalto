import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { ValidationClient } from "@/components/validate/validation-client"

export default async function ValidatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: document } = await admin
    .from("documents")
    .select("*, projects(name, client_name, phase)")
    .eq("validation_token", token)
    .single()

  if (!document) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold">Chalto</h1>
          <p className="text-muted-foreground mt-1">Validation de document</p>
        </div>
        <ValidationClient document={document} token={token} />
      </div>
    </div>
  )
}
