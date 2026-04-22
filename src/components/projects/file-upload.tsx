"use client"

import { useState, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  documentId: string
  userId: string
  onSuccess?: (url: string) => void
}

export function FileUpload({ documentId, userId, onSuccess }: FileUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = useMemo(() => createClient(), [])

  const acceptedTypes = ["application/pdf", "image/jpeg", "image/png"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  const handleFile = async (file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Format non supporté", {
        description: "Utilisez un fichier PDF, JPG ou PNG uniquement.",
      })
      return
    }

    if (file.size > maxSize) {
      toast.error("Fichier trop volumineux", {
        description: `Votre fichier fait ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum autorisé : 10 MB.`,
      })
      return
    }

    setUploading(true)

    const ext = file.name.split(".").pop()
    const path = `${userId}/${documentId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error("Upload échoué", {
        description:
          "Vérifiez votre connexion et réessayez. Si le problème persiste, contactez le support.",
      })
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from("documents").getPublicUrl(path)

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        file_url: data.publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      })
      .eq("id", documentId)

    if (updateError) {
      toast.error("Erreur lors de la mise à jour")
      setUploading(false)
      return
    }

    toast.success("Fichier uploadé avec succès ✅")
    onSuccess?.(data.publicUrl)
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Upload en cours...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">Glisser un fichier ou cliquer pour uploader</p>
          <p className="text-xs text-muted-foreground">PDF, JPG, PNG — 10MB maximum</p>
        </div>
      )}
    </div>
  )
}
