"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  FileText,
  ChevronRight,
  ChevronDown,
  Trash2,
  RefreshCw,
  Upload,
  Plus,
  X,
  Camera,
  Sparkles,
} from "lucide-react"
import { AddDocumentDialog } from "@/components/projects/add-document-dialog"
import { GenerateDocumentDialog } from "@/components/documents/GenerateDocumentDialog"
import { DropboxFolderPicker } from "@/components/projects/dropbox-folder-picker"
import { ActionMenu } from "@/components/ui/action-menu"
import { Button } from "@/components/ui/button"
import { StaggerList, StaggerItem } from "@/components/ui/motion"
import { cn } from "@/lib/utils"
import { docStatusMap } from "@/lib/doc-status"
import type { ProjectDocument, CloudLink } from "@/types/domain"
import { toast } from "sonner"

interface ProjectDocumentsProps {
  documents: ProjectDocument[]
  projectId: string
  projectName: string
  workType?: string
  clientName?: string
  professionSlug?: string | null
  selectedDocId: string | null
  onSelectDoc: (doc: ProjectDocument) => void
  onDeleteDoc?: (docId: string) => void
  isOpen?: boolean
  onToggle?: () => void
  readOnly?: boolean
  highlightedId?: string | null
  unreadCount?: number
  cloudLinks?: CloudLink[]
  hasDropboxConnected?: boolean
}

function DropboxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#0061FF" className={className} aria-hidden="true">
      <path d="M6 2L0 6l6 4 6-4L6 2zM18 2l-6 4 6 4 6-4-6-4zM0 14l6 4 6-4-6-4-6 4zM18 10l-6 4 6 4 6-4-6-4zM6 19.5L12 23l6-3.5-6-4-6 4z" />
    </svg>
  )
}

function DocItem({
  doc,
  isSelected,
  highlightedId,
  onSelectDoc,
  onDeleteDoc,
}: {
  doc: ProjectDocument
  isSelected: boolean
  highlightedId?: string | null
  onSelectDoc: (doc: ProjectDocument) => void
  onDeleteDoc?: (docId: string) => void
}) {
  const docStatus = docStatusMap[doc.status] ?? docStatusMap.draft
  const isDropbox = doc.source === "dropbox"

  return (
    <motion.div data-doc-id={doc.id} whileTap={{ scale: 0.98 }} style={{ touchAction: "pan-y" }}>
      <Card
        onClick={() => onSelectDoc(doc)}
        className={cn(
          "cursor-pointer transition-[background-color,box-shadow] duration-300 hover:shadow-sm hover:bg-muted/50 group",
          isSelected && "sm:border-primary sm:ring-2 sm:ring-primary/25",
          highlightedId === doc.id && "border-ring ring-3 ring-ring/50"
        )}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className={cn("h-2 w-2 rounded-full shrink-0", docStatus.dot)} />
          <div className="hidden sm:block bg-muted p-2 rounded-lg shrink-0">
            {isDropbox ? (
              <DropboxIcon className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="sm:hidden mb-2">
              <Badge variant={docStatus.variant} className={cn("text-xs", docStatus.className)}>
                {docStatus.label}
                {doc.version > 1 && ` · v${doc.version}`}
              </Badge>
            </div>
            <p className="text-sm font-medium truncate">{doc.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {doc.type} · {new Date(doc.created_at).toLocaleDateString("fr-FR")}
              {isDropbox && " · Dropbox"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={docStatus.variant}
              className={cn("hidden sm:inline-flex text-xs", docStatus.className)}
            >
              {docStatus.label}
              {doc.version > 1 && ` · v${doc.version}`}
            </Badge>
            {/* Poubelle — desktop uniquement, visible au survol */}
            {onDeleteDoc && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    aria-label="Supprimer le document"
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      &ldquo;{doc.name}&rdquo; sera supprimé définitivement. Cette action est
                      irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteDoc(doc.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isSelected && "text-primary"
              )}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ProjectDocuments({
  documents,
  projectId,
  projectName,
  workType,
  clientName,
  professionSlug,
  selectedDocId,
  onSelectDoc,
  onDeleteDoc,
  isOpen = true,
  onToggle,
  readOnly = false,
  highlightedId,
  unreadCount = 0,
  cloudLinks = [],
  hasDropboxConnected = false,
}: ProjectDocumentsProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [pickerOpen, setPickerOpen] = useState(false)
  const [addDocOpen, setAddDocOpen] = useState(false)
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  async function handlePhotoCapture(file: File) {
    setPhotoUploading(true)
    const toastId = toast.loading("Envoi de la photo...")
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const date = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      const { data: docId, error: insertError } = await supabase.rpc(
        "create_document_with_contributors",
        {
          p_project_id: projectId,
          p_name: `Photo du ${date}`,
          p_type: "Photo",
          p_audience: "client",
          p_contributor_ids: [],
        }
      )
      if (insertError || !docId) throw new Error("Création document échouée")

      const ext = file.name.split(".").pop() ?? "jpg"
      const path = `${user.id}/${docId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path)
      await supabase
        .from("documents")
        .update({
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        })
        .eq("id", docId)

      toast.success("Photo ajoutée", { id: toastId })
      router.refresh()
    } catch {
      toast.error("Erreur lors de l'envoi de la photo", { id: toastId })
    } finally {
      setPhotoUploading(false)
      if (photoInputRef.current) photoInputRef.current.value = ""
    }
  }

  async function handleUnlink(linkId: string) {
    setUnlinkingId(linkId)
    try {
      const res = await fetch("/api/dropbox/link", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId, projectId }),
      })
      if (!res.ok) throw new Error()
      toast.success("Dossier Dropbox délié")
      router.refresh()
    } catch {
      toast.error("Impossible de délier le dossier")
    } finally {
      setUnlinkingId(null)
    }
  }

  useEffect(() => {
    if (!highlightedId) return
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-doc-id="${highlightedId}"]`)
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 300)
    return () => clearTimeout(t)
  }, [highlightedId])

  return (
    <>
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between group",
          isOpen && "mb-4",
          onToggle && "cursor-pointer"
        )}
        onClick={onToggle}
      >
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-md transition-colors",
            onToggle && "group-hover:bg-muted"
          )}
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              !isOpen && "-rotate-90"
            )}
          />
          <h2 className="font-semibold">Documents</h2>
          <span
            className={cn(
              "inline-flex items-center justify-center text-xs h-5 min-w-5 rounded-full transition-colors",
              unreadCount > 0
                ? "bg-destructive text-destructive-foreground font-semibold"
                : "bg-muted text-muted-foreground"
            )}
          >
            {documents.length}
          </span>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-4.5 pl-3" onClick={(e) => e.stopPropagation()}>
            {isDesktop ? (
              <GenerateDocumentDialog
                projectId={projectId}
                projectName={projectName}
                workType={workType ?? ""}
                clientName={clientName}
                professionSlug={professionSlug}
              />
            ) : (
              <>
                <div
                  role="button"
                  className="ai-btn-border rounded-md p-px inline-flex cursor-pointer shrink-0"
                  onClick={() => router.push(`/projects/${projectId}/generate`)}
                >
                  <div className="inline-flex items-center gap-1.5 h-11 px-4 rounded-[5px] bg-background text-sm font-medium hover:bg-muted/60 transition-colors lg:h-8 lg:px-3">
                    <Sparkles className="hidden sm:inline h-3.5 w-3.5 text-violet-500" />
                    <span className="sm:hidden">IA</span>
                    <span className="hidden sm:inline">Générer IA</span>
                  </div>
                </div>
              </>
            )}
            <ActionMenu
              trigger={
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Ajouter</span>
                </Button>
              }
              items={[
                {
                  label: "Upload un fichier",
                  icon: <Upload className="h-4 w-4" />,
                  onClick: () => {
                    if (!isDesktop) {
                      router.push(`/projects/${projectId}/documents/new`)
                    } else {
                      setTimeout(() => setAddDocOpen(true), 300)
                    }
                  },
                },
                ...(!isDesktop
                  ? [
                      {
                        label: photoUploading ? "Envoi en cours..." : "Prendre une photo",
                        icon: <Camera className="h-4 w-4" />,
                        onClick: () => !photoUploading && photoInputRef.current?.click(),
                      },
                    ]
                  : []),
                ...(hasDropboxConnected
                  ? [
                      {
                        label: "Lier Dropbox",
                        icon: <DropboxIcon className="h-4 w-4" />,
                        onClick: () => setTimeout(() => setPickerOpen(true), 300),
                      },
                    ]
                  : []),
              ]}
            />
            <AddDocumentDialog
              projectId={projectId}
              open={addDocOpen}
              onOpenChange={setAddDocOpen}
            />
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handlePhotoCapture(file)
              }}
            />
          </div>
        )}
      </div>

      <DropboxFolderPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        projectId={projectId}
        onLinked={(count) => {
          toast.success(
            count > 0
              ? `${count} fichier${count > 1 ? "s" : ""} synchronisé${count > 1 ? "s" : ""} depuis Dropbox`
              : "Dossier lié — les prochains fichiers ajoutés seront synchronisés automatiquement"
          )
          router.refresh()
        }}
      />

      {/* Liste collapsible */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="docs-list"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Banner dossiers Dropbox liés — visible uniquement quand la section est ouverte */}
            {cloudLinks.length > 0 && (
              <div className="mb-3 space-y-1.5 px-1">
                {cloudLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2"
                  >
                    <DropboxIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span className="truncate font-mono flex-1">{link.remote_path}</span>
                    {link.last_synced_at ? (
                      <span className="shrink-0 flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        {new Date(link.last_synced_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      <span className="shrink-0">En attente</span>
                    )}
                    {!readOnly && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={unlinkingId === link.id}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Délier ce dossier Dropbox ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Le dossier <span className="font-mono">{link.remote_path}</span> ne
                              sera plus synchronisé. Les documents déjà importés restent dans le
                              projet.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleUnlink(link.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Délier
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="p-1">
              {documents.length > 0 ? (
                <StaggerList className="space-y-2">
                  {documents.map((doc) => (
                    <StaggerItem key={doc.id}>
                      <DocItem
                        doc={doc}
                        isSelected={selectedDocId === doc.id}
                        highlightedId={highlightedId}
                        onSelectDoc={onSelectDoc}
                        onDeleteDoc={!readOnly ? onDeleteDoc : undefined}
                      />
                    </StaggerItem>
                  ))}
                </StaggerList>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="font-medium text-sm">Aucun document</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ajoutez des documents à valider par votre client
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
