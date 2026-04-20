"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Mail, Check } from "lucide-react"
import { analytics } from "@/lib/analytics"
import { OnboardingTooltip } from "@/components/ui/onboarding-tooltip"

interface InviteButtonProps {
  contactId: string
  projectId: string
  contactName: string
}

export function InviteButton({ contactId, projectId, contactName }: InviteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

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
      setSent(true)
      router.refresh()
    } else {
      const data = await res.json()
      if (data.error === "Email manquant") {
        toast.error("Ce contact n'a pas d'email renseigné")
      } else {
        toast.error("Erreur lors de l'envoi")
      }
    }

    setLoading(false)
  }

  if (sent) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-primary">
        <Check className="h-3.5 w-3.5" />
        Invitation envoyée
      </div>
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
