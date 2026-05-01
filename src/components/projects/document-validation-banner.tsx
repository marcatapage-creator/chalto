import { CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ValidationData } from "./document-panel-types"

export function ValidationResultBanner({
  validation,
  localStatus,
}: {
  validation: ValidationData | null
  localStatus: string
}) {
  if (!validation || localStatus === "sent" || localStatus === "draft") return null

  return (
    <div className="px-4 py-3 border-b shrink-0">
      {validation.status === "commented" ? (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <MessageSquare className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Commenté par {validation.client_name ?? "le prestataire"}
            </p>
            {validation.comment && (
              <p className="text-sm text-muted-foreground italic">{`"${validation.comment}"`}</p>
            )}
            {validation.approved_at && (
              <p className="text-xs text-muted-foreground">
                {new Date(validation.approved_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg",
            validation.status === "approved" ? "bg-primary/10" : "bg-destructive/10"
          )}
        >
          {validation.status === "approved" ? (
            <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {validation.status === "approved"
                ? `Approuvé par ${validation.client_name ?? "le client"}`
                : `Refusé par ${validation.client_name ?? "le client"}`}
            </p>
            {validation.comment && (
              <div className="flex items-start gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground italic">{`"${validation.comment}"`}</p>
              </div>
            )}
            {validation.approved_at && (
              <p className="text-xs text-muted-foreground">
                {new Date(validation.approved_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
