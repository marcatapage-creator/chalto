import { CheckCircle, XCircle, MessageSquare, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ValidationEntry, ContributorValidator } from "./document-panel-types"

export function ValidationsSection({
  allValidations,
  validatorContributors,
  clientName,
  activeVersion,
  isCurrentVersion = true,
}: {
  allValidations: ValidationEntry[]
  validatorContributors: ContributorValidator[]
  clientName?: string
  activeVersion?: number
  isCurrentVersion?: boolean
}) {
  // Filtrage par version : null traité comme V1 (données antérieures à la migration)
  const visibleValidations =
    activeVersion == null
      ? allValidations
      : allValidations.filter((v) => (v.version ?? 1) === activeVersion)

  // Validation client (contributor_id === null)
  const clientValidation = visibleValidations.find((v) => v.contributor_id === null)

  // Validations prestataires pour cette version — le nom vient de client_name stocké à la validation
  const contributorValidations = visibleValidations.filter((v) => v.contributor_id !== null)

  // Sur la version courante uniquement : prestataires (mode validation) en attente de réponse
  const validatedIds = new Set(contributorValidations.map((v) => v.contributor_id))
  const pendingContributors: ContributorValidator[] = isCurrentVersion
    ? validatorContributors.filter((c) => !validatedIds.has(c.id))
    : []

  const hasContent =
    clientValidation || contributorValidations.length > 0 || pendingContributors.length > 0
  if (!hasContent) return null

  const statusCfg = (status?: string | null) => {
    if (status === "approved") return { icon: CheckCircle, cls: "text-primary", label: "Approuvé" }
    if (status === "rejected") return { icon: XCircle, cls: "text-destructive", label: "Refusé" }
    if (status === "commented") return { icon: MessageSquare, cls: "text-blue-500", label: "Lu" }
    return { icon: Clock, cls: "text-muted-foreground", label: "En attente" }
  }

  return (
    <div className="space-y-2 pb-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Validations
      </p>
      <div className="space-y-1">
        {/* Client */}
        {clientValidation &&
          (() => {
            const cfg = statusCfg(clientValidation.status)
            const Icon = cfg.icon
            return (
              <div className="flex items-center gap-2 text-sm py-0.5">
                <Icon className={cn("h-3.5 w-3.5 shrink-0", cfg.cls)} />
                <span className="min-w-0 truncate">
                  {clientValidation.client_name ?? clientName ?? "Client"}
                </span>
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

        {/* Prestataires ayant agi sur cette version */}
        {contributorValidations.map((cv, i) => {
          const cfg = statusCfg(cv.status)
          const Icon = cfg.icon
          return (
            <div
              key={`${cv.contributor_id ?? "anon"}-${i}`}
              className="flex items-center gap-2 text-sm py-0.5"
            >
              <Icon className={cn("h-3.5 w-3.5 shrink-0", cfg.cls)} />
              <span className="min-w-0 truncate">{cv.client_name ?? "Prestataire"}</span>
              <span className={cn("text-xs ml-auto shrink-0", cfg.cls)}>{cfg.label}</span>
              {cv.approved_at && (
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

        {/* Prestataires en attente (version courante uniquement) */}
        {pendingContributors.map((c) => {
          const cfg = statusCfg(null)
          const Icon = cfg.icon
          return (
            <div key={c.id} className="flex items-center gap-2 text-sm py-0.5">
              <Icon className={cn("h-3.5 w-3.5 shrink-0", cfg.cls)} />
              <span className="min-w-0 truncate">{c.name}</span>
              <span className={cn("text-xs ml-auto shrink-0", cfg.cls)}>{cfg.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
