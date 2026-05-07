"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function PrintButton() {
  const router = useRouter()

  return (
    <div className="print:hidden fixed top-4 left-4 right-4 flex items-center justify-between z-50">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 bg-background border text-sm font-medium px-3 py-2 rounded-lg shadow-md hover:bg-muted transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>
      <button
        onClick={() => window.print()}
        className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 transition-colors"
      >
        Imprimer / Enregistrer PDF
      </button>
    </div>
  )
}
