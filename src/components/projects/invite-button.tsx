"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Mail, Check } from "lucide-react"

interface InviteButtonProps {
  contactId: string
  projectId: string
  contactName: string
}

export function InviteButton({ contactId, projectId, contactName }: InviteButtonProps) {
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
      toast.success(`Invitation envoyée à ${contactName} ✅`)
      setSent(true)
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
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-xs"
      onClick={handleInvite}
      disabled={loading}
    >
      <Mail className="h-3 w-3 mr-1.5" />
      {loading ? "Envoi..." : "Inviter"}
    </Button>
  )
}
