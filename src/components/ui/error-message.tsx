import { AlertCircle, WifiOff, Lock, FileX } from "lucide-react"
import { cn } from "@/lib/utils"

type ErrorType = "network" | "auth" | "notfound" | "upload" | "generic"

interface ErrorMessageProps {
  type?: ErrorType
  message?: string
  className?: string
}

const errorConfig: Record<
  ErrorType,
  { icon: React.ElementType; title: string; description: string }
> = {
  network: {
    icon: WifiOff,
    title: "Problème de connexion",
    description: "Vérifiez votre connexion internet et réessayez.",
  },
  auth: {
    icon: Lock,
    title: "Session expirée",
    description: "Veuillez vous reconnecter pour continuer.",
  },
  notfound: {
    icon: FileX,
    title: "Introuvable",
    description: "Ce contenu n'existe pas ou a été supprimé.",
  },
  upload: {
    icon: AlertCircle,
    title: "Échec de l'upload",
    description: "Le fichier n'a pas pu être uploadé. Réessayez.",
  },
  generic: {
    icon: AlertCircle,
    title: "Une erreur est survenue",
    description: "Veuillez réessayer ou contacter le support.",
  },
}

export function ErrorMessage({ type = "generic", message, className }: ErrorMessageProps) {
  const config = errorConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20",
        className
      )}
    >
      <Icon className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-destructive">{config.title}</p>
        <p className="text-xs text-destructive/80">{message ?? config.description}</p>
      </div>
    </div>
  )
}
