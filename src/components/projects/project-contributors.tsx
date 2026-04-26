"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  ChevronDown,
  Mail,
  Copy,
  Check,
  UserPlus,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { cn, initials } from "@/lib/utils"
import { fetchWithTimeout } from "@/lib/fetch-timeout"
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
  onContributorsChange?: (ids: Set<string>) => void
  readOnly?: boolean
  defaultOpen?: boolean
  onOpen?: () => void
}

export function ProjectContributors({
  projectId,
  contacts,
  onContributorsChange,
  readOnly = false,
  defaultOpen = true,
  onOpen,
}: ProjectContributorsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [highlightedContributorId, setHighlightedContributorId] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const notifyChange = useCallback(
    (list: Contributor[]) => {
      onContributorsChange?.(new Set(list.map((c) => c.contact_id)))
    },
    [onContributorsChange]
  )

  useEffect(() => {
    supabase
      .from("contributors")
      .select("id, name, invite_token, contact_id, professions(label)")
      .eq("project_id", projectId)
      .then(({ data }) => {
        if (data) {
          const list = data as unknown as Contributor[]
          setContributors(list)
          notifyChange(list)
        }
      })
  }, [projectId, supabase, notifyChange])

  useEffect(() => {
    if (!highlightedContributorId) return
    const el = document.querySelector(`[data-contributor-id="${highlightedContributorId}"]`)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
    const t = setTimeout(() => setHighlightedContributorId(null), 2500)
    return () => clearTimeout(t)
  }, [highlightedContributorId])

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
    const res = await fetchWithTimeout("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contact.id, projectId }),
    })

    if (res.ok) {
      const { data } = await supabase
        .from("contributors")
        .select("id, name, invite_token, contact_id, professions(label)")
        .eq("project_id", projectId)
      if (data) {
        const list = data as unknown as Contributor[]
        setContributors(list)
        notifyChange(list)
        const newContributor = list.find((c) => c.contact_id === contact.id)
        if (newContributor) {
          setIsOpen(true)
          setHighlightedContributorId(newContributor.id)
        }
      }
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

  const handleDelete = async (contributorId: string) => {
    const contributor = contributors.find((c) => c.id === contributorId)
    if (!contributor) return
    setContributors((prev) => {
      const filtered = prev.filter((c) => c.id !== contributorId)
      notifyChange(filtered)
      return filtered
    })
    const { error } = await supabase.from("contributors").delete().eq("id", contributorId)
    if (error) {
      setContributors((prev) => {
        const restored = [...prev, contributor]
        notifyChange(restored)
        return restored
      })
      toast.error("Erreur lors de la suppression")
    } else {
      toast.success(`${contributor.name} retiré du projet`)
    }
  }

  return (
    <div className="space-y-2">
      <div
        className="flex items-center justify-between group cursor-pointer"
        onClick={() => {
          if (!isOpen) onOpen?.()
          setIsOpen((v) => !v)
        }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-md group-hover:bg-muted transition-colors">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              !isOpen && "-rotate-90"
            )}
          />
          <span className="font-semibold">Prestataires</span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {contributors.length}
          </span>
        </div>

        {!readOnly && (
          <div className="pl-3" onClick={(e) => e.stopPropagation()}>
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
        )}
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
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center border rounded-xl">
                  <Users className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Aucun prestataire invité</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Invitez vos prestataires pour leur partager documents et tâches
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contributors.map((contributor) => (
                    <div
                      key={contributor.id}
                      data-contributor-id={contributor.id}
                      className={cn(
                        "flex items-center justify-between gap-3 p-3 rounded-lg border transition-all duration-300",
                        highlightedContributorId === contributor.id &&
                          "border-ring ring-3 ring-ring/50"
                      )}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopy(contributor)}>
                            {copied === contributor.id ? (
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            {copied === contributor.id ? "Copié !" : "Copier le lien"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => void handleDelete(contributor.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
