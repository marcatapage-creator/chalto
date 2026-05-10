"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ActionMenu } from "@/components/ui/action-menu"
import { MoreHorizontal, Pencil, Trash2, Archive, ArchiveRestore } from "lucide-react"
import { toast } from "sonner"

export function DeleteProjectButton({
  projectId,
  projectName,
  projectStatus,
}: {
  projectId: string
  projectName: string
  projectStatus?: string
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const isArchived = projectStatus === "archived"

  const handleArchive = async () => {
    setArchiving(true)
    const newStatus = isArchived ? "active" : "archived"
    const { error } = await supabase
      .from("projects")
      .update({ status: newStatus })
      .eq("id", projectId)
    if (error) {
      toast.error("Erreur lors de l'opération")
    } else {
      toast.success(isArchived ? "Projet désarchivé" : "Projet archivé")
      router.refresh()
    }
    setArchiving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from("projects").delete().eq("id", projectId)
    if (error) {
      toast.error("Erreur lors de la suppression")
      setDeleting(false)
      return
    }
    toast.success("Projet supprimé")
    router.refresh()
  }

  return (
    <>
      <ActionMenu
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 max-lg:absolute max-lg:top-4 max-lg:right-4 max-lg:h-11 max-lg:w-11"
            disabled={archiving}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
        items={[
          {
            label: "Modifier",
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => router.push(`/projects/${projectId}/edit`),
          },
          {
            label: isArchived ? "Désarchiver" : "Archiver",
            icon: isArchived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            ),
            onClick: handleArchive,
          },
          {
            label: "Supprimer",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => setConfirmOpen(true),
            destructive: true,
            separator: true,
          },
        ]}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Supprimer le projet</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer <strong>{projectName}</strong> ? Cette action est
              irréversible et supprimera tous les documents associés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleting}>
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
