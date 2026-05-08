"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"

export function PrintButton() {
  const pathname = usePathname()
  // /projects/[id]/situations/print → /projects/[id]
  const projectHref = pathname.replace(/\/situations\/print$/, "")

  return (
    <div className="print:hidden fixed top-4 left-4 right-4 flex items-center justify-between z-50">
      <Link
        href={projectHref}
        className="inline-flex items-center gap-1.5 bg-white border text-sm font-medium px-3 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-gray-800 transition-colors"
      >
        <Printer className="h-4 w-4" />
        Imprimer / Enregistrer PDF
      </button>
    </div>
  )
}
