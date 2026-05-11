"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { ActionMenu } from "@/components/ui/action-menu"
import {
  Users,
  ChevronDown,
  Mail,
  Copy,
  Check,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Plus,
  RefreshCw,
} from "lucide-react"
import { cn, initials } from "@/lib/utils"
import { fetchWithTimeout } from "@/lib/fetch-timeout"
import { AnimatePresence, motion } from "framer-motion"
import type { Contact, Contributor } from "@/types/domain"

interface ProjectContributorsProps {
  projectId: string
  contacts: Contact[]
  onContributorsChange?: (ids: Set<string>) => void
  readOnly?: boolean
  defaultOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  collapseSignal?: number
  expandSignal?: number
}

export function ProjectContributors({
  projectId,
  contacts,
  onContributorsChange,
  readOnly = false,
  defaultOpen = true,
  onOpen,
  onClose,
  collapseSignal,
  expandSignal,
}: ProjectContributorsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [highlightedContributorId, setHighlightedContributorId] = useState<string | null>(null)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [newContact, setNewContact] = useState({ name: "", email: "" })
  const [addingContact, setAddingContact] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const prevCollapseSignal = useRef(collapseSignal ?? 0)
  useEffect(() => {
    if (collapseSignal === undefined || collapseSignal === prevCollapseSignal.current) return
    prevCollapseSignal.current = collapseSignal
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
  }, [collapseSignal])
  const prevExpandSignal = useRef(expandSignal ?? 0)
  useEffect(() => {
    if (expandSignal === undefined || expandSignal === prevExpandSignal.current) return
    prevExpandSignal.current = expandSignal
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(true)
  }, [expandSignal])

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

  const handleAddContact = async () => {
    if (!newContact.name) {
      toast.error("Le nom est obligatoire")
      return
    }
    setAddingContact(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setAddingContact(false)
      return
    }
    const { error } = await supabase.from("contacts").insert({
      user_id: user.id,
      name: newContact.name,
      email: newContact.email || null,
    })
    if (error) {
      toast.error("Erreur lors de la création")
    } else {
      toast.success(`${newContact.name} ajouté à l'annuaire ✅`)
      setNewContact({ name: "", email: "" })
      setAddContactOpen(false)
      router.refresh()
    }
    setAddingContact(false)
  }

  const handleRenew = async (contributor: Contributor) => {
    setLoading(contributor.id)
    const res = await fetchWithTimeout(`/api/contributors/${contributor.id}/renew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contributorId: contributor.id, projectId }),
    })
    if (res.ok) {
      const data = await res.json()
      setContributors((prev) =>
        prev.map((c) =>
          c.id === contributor.id ? { ...c, invite_token: data.contributor.invite_token } : c
        )
      )
      toast.success("Lien renouvelé pour 1 an ✅")
    } else {
      toast.error("Erreur lors du renouvellement")
    }
    setLoading(null)
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
        className="flex items-center justify-between group cursor-pointer active:opacity-75"
        onClick={() => {
          if (!isOpen) onOpen?.()
          else onClose?.()
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
          <span className="inline-flex items-center justify-center text-xs text-muted-foreground bg-muted h-5 min-w-5 rounded-full">
            {contributors.length}
          </span>
        </div>

        {!readOnly && (
          <div className="pl-3" onClick={(e) => e.stopPropagation()}>
            <ResponsiveDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              trigger={
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5 sm:hidden" />
                  <UserPlus className="h-3.5 w-3.5 hidden sm:block" />
                  <span className="hidden sm:inline">Inviter</span>
                </Button>
              }
              title="Inviter un prestataire"
            >
              {availableContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {contacts.length === 0
                      ? "Aucun contact dans votre carnet d'adresses"
                      : "Tous vos contacts sont déjà invités sur ce projet"}
                  </p>
                  {!addContactOpen ? (
                    <Button size="sm" onClick={() => setAddContactOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Ajouter un contact
                    </Button>
                  ) : (
                    <div className="w-full space-y-2 text-left pt-1">
                      <Input
                        placeholder="Nom *"
                        value={newContact.name}
                        onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
                      />
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setAddContactOpen(false)
                            setNewContact({ name: "", email: "" })
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          className="flex-1"
                          loading={addingContact}
                          onClick={handleAddContact}
                        >
                          Créer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="max-h-80 overflow-y-auto pr-1 space-y-2">
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
                  {!addContactOpen ? (
                    <button
                      onClick={() => setAddContactOpen(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter un nouveau contact
                    </button>
                  ) : (
                    <div className="space-y-2 pt-2 border-t">
                      <Input
                        placeholder="Nom *"
                        value={newContact.name}
                        onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setAddContactOpen(false)
                            setNewContact({ name: "", email: "" })
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          className="flex-1"
                          loading={addingContact}
                          onClick={handleAddContact}
                        >
                          Créer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ResponsiveDialog>
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
            <div className="p-1 max-w-2xl">
              {contributors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center border rounded-xl bg-white dark:bg-card">
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
                        "flex items-center justify-between gap-3 p-3 rounded-lg border bg-white dark:bg-card transition-all duration-300",
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
                      <ActionMenu
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 max-lg:h-11 max-lg:w-11 shrink-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                        items={[
                          {
                            label: copied === contributor.id ? "Copié !" : "Copier le lien",
                            icon:
                              copied === contributor.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              ),
                            onClick: () => handleCopy(contributor),
                          },
                          {
                            label: "Renouveler le lien",
                            icon: <RefreshCw className="h-4 w-4" />,
                            onClick: () => void handleRenew(contributor),
                            disabled: loading === contributor.id,
                          },
                          {
                            label: "Supprimer",
                            icon: <Trash2 className="h-4 w-4" />,
                            onClick: () => void handleDelete(contributor.id),
                            destructive: true,
                            separator: true,
                          },
                        ]}
                      />
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
