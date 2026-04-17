"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Building2, AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
          <h1 className="text-xl font-bold">Une erreur est survenue</h1>
          <p className="text-muted-foreground text-sm">
            Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou revenir à l&apos;accueil.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Réessayer</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
            Retour au dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
