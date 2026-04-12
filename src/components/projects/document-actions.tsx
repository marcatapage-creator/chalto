"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Link, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DocumentActions({ doc }: { doc: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCopyLink = () => {
    const validationUrl = `${window.location.origin}/validate/${doc.validation_token}`
    navigator.clipboard.writeText(validationUrl)
    toast.success("Lien copié dans le presse-papiers")
  }

  const handleSend = async () => {
    setLoading(true)
    await supabase
      .from("documents")
      .update({ status: "sent" })
      .eq("id", doc.id)
    router.refresh()
    setLoading(false)
    toast.success("Document marqué comme envoyé")
  }

  const handleDelete = async () => {
    await supabase.from("documents").delete().eq("id", doc.id)
    router.refresh()
    toast.success("Document supprimé")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link className="mr-2 h-4 w-4" />
          Copier le lien client
        </DropdownMenuItem>
        {doc.status === "draft" && (
          <DropdownMenuItem onClick={handleSend} disabled={loading}>
            <Send className="mr-2 h-4 w-4" />
            Marquer comme envoyé
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
