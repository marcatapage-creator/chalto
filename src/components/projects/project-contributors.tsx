"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Users, ChevronDown, Mail, Copy, Check, UserPlus } from "lucide-react"
import { cn, initials } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

interface Contact {
  id: string
  name: string
  professions?: { label: string }[]
}

interface Contributor {
  id: string
  name: string
  invite_token: string
  contact_id: string
  professions?: { label: string } | null
}

interface ProjectContributorsProps {
  projectId: string
  contacts: Contact[]
}

export function ProjectContributors({ projectId, contacts }: ProjectContributorsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase
      .from("contributors")
      .select("id, name, invite_token, contact_id, professions(label)")
      .eq("project_id", projectId)
      .then(({ data }) => {
        if (data) setContributors(data as unknown as Contributor[])
      })
  }, [projectId, supabase])

  const invitedContactIds = useMemo(
    () => new Set(contributors.map((c) => c.contact_id)),
    [contributors]
  )
  const availableContacts = useMemo(
    () => contacts.filter((c) => !invitedContactIds.has(c.id)),
    [contacts, invitedContactIds]
  )

  const handleInvite = async (contact: Contact) => {
    setLoading(contact.id)
    const res = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contact.id, projectId }),
    })

    if (res.ok) {
      const { data } = await supabase
        .from("contributors")
        .select("id, name, invite_token, contact_id, professions(label)")
        .eq("project_id", projectId)
      if (data) setContributors(data as unknown as Contributor[])
      toast.success(`Invitation envoyée à ${contact.name} ✅`)
      if (availableContacts.length <= 1) setDialogOpen(false)
    } else {
      const data = await res.json()
      toast.error(
        data.error === "Email manquant"
          ? "Ce contact n'a pas d'email renseigné"
          : "Erreur lors de l'envoi"
      )
    }
    setLoading(null)
  }

  const handleCopy = (contributor: Contributor) => {
    const url = `${window.location.origin}/invite/${contributor.invite_token}`
    void navigator.clipboard.writeText(url)
    setCopied(contributor.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleReinvite = async (contributor: Contributor) => {
    setLoading(contributor.id)
    const res = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contributor.contact_id, projectId }),
    })
    if (res.ok) {
      toast.success(`Invitation renvoyée à ${contributor.name} ✅`)
    } else {
      toast.error("Erreur lors de l'envoi")
    }
    setLoading(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-1.5 group px-2 py-1 -mx-2 rounded-md hover:bg-muted transition-colors"
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              !isOpen && "-rotate-90"
            )}
          />
          <span className="font-semibold group-hover:text-foreground transition-colors">
            Prestataires
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {contributors.length}
          </span>
        </button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              <UserPlus className="h-3.5 w-3.5" />
              Inviter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un prestataire</DialogTitle>
            </DialogHeader>
            {availableContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {contacts.length === 0
                    ? "Aucun contact dans votre carnet d'adresses"
                    : "Tous vos contacts sont déjà invités sur ce projet"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {availableContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{contact.name}</p>
                      {contact.professions?.[0]?.label && (
                        <p className="text-xs text-muted-foreground">
                          {contact.professions[0].label}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      disabled={loading === contact.id}
                      onClick={() => handleInvite(contact)}
                    >
                      <Mail className="h-3.5 w-3.5 mr-1.5" />
                      {loading === contact.id ? "Envoi..." : "Inviter"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="contributors-list"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-1">
              {contributors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-xl">
                  <Users className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Aucun prestataire invité</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invitez vos prestataires pour leur partager documents et tâches
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contributors.map((contributor) => (
                    <div
                      key={contributor.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                            {initials(contributor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{contributor.name}</p>
                          {contributor.professions?.label && (
                            <p className="text-xs text-muted-foreground truncate">
                              {contributor.professions.label}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleCopy(contributor)}
                        >
                          {copied === contributor.id ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {copied === contributor.id ? "Copié" : "Lien"}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          disabled={loading === contributor.id}
                          onClick={() => handleReinvite(contributor)}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">
                            {loading === contributor.id ? "Envoi..." : "Réinviter"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
