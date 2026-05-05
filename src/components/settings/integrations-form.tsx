"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export interface DropboxIntegration {
  provider_account_email: string | null
  connected_at: string
  status: string
}

function formatRelativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

export function IntegrationsForm({
  dropboxIntegration,
  error,
}: {
  dropboxIntegration: DropboxIntegration | null
  error?: string | null
}) {
  const router = useRouter()
  const [disconnecting, setDisconnecting] = useState(false)

  const errorMessages: Record<string, string> = {
    dropbox_denied: "Connexion Dropbox annulée.",
    dropbox_state: "Erreur de sécurité OAuth. Réessayez.",
    dropbox_token: "Impossible d'obtenir les tokens Dropbox. Réessayez.",
    dropbox_save: "Erreur lors de la sauvegarde. Réessayez.",
    dropbox_config: "Configuration Dropbox manquante. Contactez le support.",
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      const res = await fetch("/api/auth/dropbox/disconnect", { method: "DELETE" })
      if (!res.ok) {
        toast.error("Erreur lors de la déconnexion")
        return
      }
      toast.success("Dropbox déconnecté")
      router.refresh()
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && errorMessages[error] && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          {errorMessages[error]}
        </p>
      )}

      {/* Dropbox */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <DropboxIcon />
                Dropbox
              </CardTitle>
              <CardDescription>
                {dropboxIntegration
                  ? "Vos fichiers Dropbox se synchronisent automatiquement dans vos projets."
                  : "Synchronisez automatiquement vos fichiers Dropbox vers vos projets Chalto."}
              </CardDescription>
            </div>
            {dropboxIntegration ? (
              <Badge variant="secondary" className="shrink-0 text-emerald-700 bg-emerald-50">
                Connecté
              </Badge>
            ) : (
              <Badge variant="outline" className="shrink-0 text-muted-foreground">
                Non connecté
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {dropboxIntegration ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-1">
                {dropboxIntegration.provider_account_email && (
                  <p>Compte : {dropboxIntegration.provider_account_email}</p>
                )}
                <p>Connecté {formatRelativeTime(dropboxIntegration.connected_at)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  loading={disconnecting}
                  onClick={handleDisconnect}
                >
                  {disconnecting ? "Déconnexion..." : "Déconnecter"}
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" asChild>
              <a href="/api/auth/dropbox/connect">Connecter Dropbox</a>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Google Drive — bientôt disponible */}
      <Card className="opacity-60">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <GoogleDriveIcon />
                Google Drive
              </CardTitle>
              <CardDescription>
                Synchronisez vos fichiers Google Drive vers vos projets Chalto.
              </CardDescription>
            </div>
            <Badge variant="outline" className="shrink-0 text-muted-foreground">
              Bientôt
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button size="sm" disabled>
            Connecter Google Drive
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function DropboxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0061FF" aria-hidden="true">
      <path d="M6 2L0 6l6 4 6-4L6 2zM18 2l-6 4 6 4 6-4-6-4zM0 14l6 4 6-4-6-4-6 4zM18 10l-6 4 6 4 6-4-6-4zM6 19.5L12 23l6-3.5-6-4-6 4z" />
    </svg>
  )
}

function GoogleDriveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.433 22l4-6.933H22l-4 6.933H4.433z" fill="#3E8AEA" />
      <path d="M2 18.067L6 11.2 10 18.067 6 22 2 18.067z" fill="#FBBC05" />
      <path d="M9.567 11.2h8l-4-6.933-4 6.933z" fill="#34A853" />
      <path d="M14 4.267L10 11.2H6l4-6.933h4z" fill="#EA4335" />
    </svg>
  )
}
