"use client"

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden fixed top-4 right-4 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 transition-colors z-50"
    >
      Imprimer / Enregistrer PDF
    </button>
  )
}
