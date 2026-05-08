"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[project error]", error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
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
          <h1 className="text-lg font-semibold">Impossible de charger ce projet</h1>
          <p className="text-muted-foreground text-sm">
            Une erreur est survenue lors du chargement. Réessayez ou revenez à la liste.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Réessayer</Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Retour</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
