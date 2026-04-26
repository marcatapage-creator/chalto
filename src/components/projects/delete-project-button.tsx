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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={archiving}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => router.push(`/projects/${projectId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchive}>
            {isArchived ? (
              <>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Désarchiver
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Archiver
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
