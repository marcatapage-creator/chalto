"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-destructive/10 rounded-full p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
          <p className="text-sm text-muted-foreground">
            Cette page a rencontré un problème. L&apos;équipe a été notifiée automatiquement.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
