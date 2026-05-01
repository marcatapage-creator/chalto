import { CheckCircle, XCircle, MessageSquare, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ValidationEntry, ContributorValidator } from "./document-panel-types"

export function ValidationsSection({
  allValidations,
  validatorContributors,
  clientName,
}: {
  allValidations: ValidationEntry[]
  validatorContributors: ContributorValidator[]
  clientName?: string
}) {
  if (allValidations.length === 0 && validatorContributors.length === 0) return null

  const statusCfg = (status?: string | null) => {
    if (status === "approved") return { icon: CheckCircle, cls: "text-primary", label: "Approuvé" }
    if (status === "rejected") return { icon: XCircle, cls: "text-destructive", label: "Refusé" }
    if (status === "commented") return { icon: MessageSquare, cls: "text-blue-500", label: "Lu" }
    return { icon: Clock, cls: "text-muted-foreground", label: "En attente" }
  }

  const clientValidation = allValidations.find((v) => v.contributor_id === null)

  return (
    <div className="space-y-2 pb-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Validations
      </p>
      <div className="space-y-1">
        {clientValidation &&
          (() => {
            const cfg = statusCfg(clientValidation.status)
            const Icon = cfg.icon
            return (
              <div className="flex items-center gap-2 text-sm py-0.5">
                <Icon className={cn("h-3.5 w-3.5 shrink-0", cfg.cls)} />
                <span className="min-w-0 truncate">{clientName ?? "Client"}</span>
                <span className={cn("text-xs ml-auto shrink-0", cfg.cls)}>{cfg.label}</span>
                {clientValidation.approved_at && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(clientValidation.approved_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            )
          })()}

        {validatorContributors.map((c) => {
          const cv = allValidations.find((v) => v.contributor_id === c.id)
          const cfg = statusCfg(cv?.status)
          const Icon = cfg.icon
          return (
            <div key={c.id} className="flex items-center gap-2 text-sm py-0.5">
              <Icon className={cn("h-3.5 w-3.5 shrink-0", cfg.cls)} />
              <span className="min-w-0 truncate">{c.name}</span>
              <span className={cn("text-xs ml-auto shrink-0", cfg.cls)}>{cfg.label}</span>
              {cv?.approved_at && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(cv.approved_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
