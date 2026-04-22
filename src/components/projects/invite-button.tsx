"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Mail, Bell } from "lucide-react"
import { analytics } from "@/lib/analytics"
import { OnboardingTooltip } from "@/components/ui/onboarding-tooltip"

interface InviteButtonProps {
  contactId: string
  projectId: string
  contactName: string
  taskId?: string
  alreadyInvited?: boolean
  onInvited?: () => void
}

export function InviteButton({
  contactId,
  projectId,
  contactName,
  taskId,
  alreadyInvited = false,
  onInvited,
}: InviteButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    setLoading(true)
    const res = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, projectId }),
    })
    if (res.ok) {
      analytics.providerInvited()
      toast.success(`Invitation envoyée à ${contactName} ✅`)
      onInvited?.()
    } else {
      const data = await res.json()
      toast.error(
        data.error === "Email manquant"
          ? "Ce contact n'a pas d'email renseigné"
          : "Erreur lors de l'envoi"
      )
    }
    setLoading(false)
  }

  const handleNotify = async () => {
    if (!taskId) return
    setLoading(true)
    const res = await fetch("/api/notify-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    })
    if (res.ok) {
      toast.success(`Rappel envoyé à ${contactName} ✅`)
    } else {
      const data = await res.json()
      toast.error(
        data.error === "Email manquant"
          ? "Aucun email pour ce prestataire"
          : "Erreur lors de l'envoi"
      )
    }
    setLoading(false)
  }

  if (alreadyInvited) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={handleNotify}
        loading={loading}
        disabled={!taskId}
      >
        <Bell className="h-3 w-3 mr-1.5" />
        {loading ? "Envoi..." : "Notifier"}
      </Button>
    )
  }

  return (
    <OnboardingTooltip
      id="invite-contributor"
      title="Invitez vos prestataires"
      description="Vos prestataires accèdent à leurs tâches via un lien — sans créer de compte."
      position="bottom"
      align="start"
    >
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={handleInvite}
        loading={loading}
      >
        <Mail className="h-3 w-3 mr-1.5" />
        {loading ? "Envoi..." : "Inviter"}
      </Button>
    </OnboardingTooltip>
  )
}
