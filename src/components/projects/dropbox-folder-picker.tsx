"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight, Folder, ArrowLeft, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DropboxEntry {
  tag: "file" | "folder"
  name: string
  path: string
  id: string
  size?: number
}

interface DropboxFolderPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onLinked: (syncedCount: number) => void
}

export function DropboxFolderPicker({
  open,
  onOpenChange,
  projectId,
  onLinked,
}: DropboxFolderPickerProps) {
  const [currentPath, setCurrentPath] = useState("")
  const [entries, setEntries] = useState<DropboxEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [linking, setLinking] = useState(false)

  const browse = useCallback(async (path: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dropbox/browse?path=${encodeURIComponent(path)}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEntries(data.entries ?? [])
      setCurrentPath(path)
    } catch {
      toast.error("Impossible de charger les dossiers Dropbox")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) browse("")
  }, [open, browse])

  const goUp = () => {
    const parent = currentPath.split("/").slice(0, -1).join("/")
    browse(parent)
  }

  const handleLink = async () => {
    setLinking(true)
    try {
      const res = await fetch("/api/dropbox/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, provider: "dropbox", remotePath: currentPath }),
      })
      if (!res.ok) throw new Error()
      const { syncedCount } = await res.json()
      onLinked(syncedCount)
      onOpenChange(false)
    } catch {
      toast.error("Erreur lors de la liaison du dossier")
    } finally {
      setLinking(false)
    }
  }

  const folders = entries.filter((e) => e.tag === "folder")
  const files = entries.filter((e) => e.tag === "file")
  const displayPath = currentPath || "/"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choisir un dossier Dropbox</DialogTitle>
        </DialogHeader>

        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-md px-3 py-2 font-mono truncate">
          <span className="shrink-0">{displayPath}</span>
        </div>

        {/* Contenu du dossier */}
        <div className="border rounded-md overflow-hidden min-h-[240px] max-h-[320px] overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {currentPath && (
                <li>
                  <button
                    onClick={goUp}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors text-muted-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span>Retour</span>
                  </button>
                </li>
              )}

              {folders.map((folder) => (
                <li key={folder.id}>
                  <button
                    onClick={() => browse(folder.path)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <Folder className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="flex-1 text-left truncate">{folder.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}

              {files.slice(0, 5).map((file) => (
                <li key={file.id}>
                  <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                </li>
              ))}

              {files.length > 5 && (
                <li className="px-3 py-2 text-xs text-muted-foreground text-center">
                  +{files.length - 5} fichiers dans ce dossier
                </li>
              )}

              {folders.length === 0 && files.length === 0 && !loading && (
                <li className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  Dossier vide
                </li>
              )}
            </ul>
          )}
        </div>

        <div className={cn("text-xs text-muted-foreground", currentPath ? "visible" : "invisible")}>
          {files.length} fichier{files.length !== 1 ? "s" : ""} seront synchronisés depuis{" "}
          <span className="font-medium text-foreground">{displayPath}</span>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={linking}>
            Annuler
          </Button>
          <Button onClick={handleLink} disabled={!currentPath || linking} loading={linking}>
            {linking ? "Liaison en cours..." : "Lier ce dossier"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
