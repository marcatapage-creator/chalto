"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function InviteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[invite error]", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <Image src="/Logo.svg" alt="Chalto" width={40} height={40} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="bg-destructive/10 rounded-full p-3">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
          </div>
          <h1 className="text-lg font-semibold">Erreur de chargement</h1>
          <p className="text-muted-foreground text-sm">
            Impossible d&apos;accéder à cet espace. Vérifiez votre lien ou réessayez.
          </p>
        </div>
        <Button onClick={reset}>Réessayer</Button>
      </div>
    </div>
  )
}
