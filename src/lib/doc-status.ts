export type DocStatusVariant = "default" | "secondary" | "outline" | "destructive"

export interface DocStatusConfig {
  label: string
  variant: DocStatusVariant
  className?: string
  dot: string
}

export const docStatusMap: Record<string, DocStatusConfig> = {
  draft: { label: "Brouillon", variant: "outline", dot: "bg-muted-foreground" },
  sent: { label: "Envoyé", variant: "secondary", dot: "bg-blue-400" },
  approved: {
    label: "Approuvé",
    variant: "outline",
    className: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Refusé",
    variant: "outline",
    className: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
  commented: {
    label: "Lu",
    variant: "secondary",
    dot: "bg-blue-400",
  },
}
