import { createAdminClient } from "@/lib/supabase/admin"
import { ValidationClient } from "@/components/validate/validation-client"
import { Building2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ValidatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: document } = await admin
    .from("documents")
    .select("*, projects(name, client_name, phase)")
    .eq("validation_token", token)
    .single()

  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary rounded-xl p-3">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="bg-destructive/10 rounded-full p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h1 className="text-xl font-bold">Lien invalide ou expiré</h1>
            <p className="text-muted-foreground text-sm">
              Ce lien de validation n&apos;existe pas ou a déjà été utilisé. Contactez votre
              professionnel pour obtenir un nouveau lien.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    )
  }

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
