import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { differenceInDays, parseISO } from "date-fns"
import Link from "next/link"
import { CalendarCheck, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { FadeIn } from "@/components/ui/motion"
import type { AdminDossierType, AdminDossierStatus } from "@/types/domain"

export const metadata = { title: "Échéances" }

const TYPE_LABEL: Record<AdminDossierType, string> = {
  permis_construire: "Permis de construire",
  declaration_prealable: "Déclaration préalable",
  doc: "DOC",
  daact: "DAACT",
  erp: "ERP",
  autre: "Autre",
}

const STATUS_CLASS: Record<AdminDossierStatus, string> = {
  en_preparation: "bg-gray-100 text-gray-600 border-gray-200",
  depose: "bg-blue-100 text-blue-700 border-blue-200",
  en_instruction: "bg-amber-100 text-amber-800 border-amber-200",
  obtenu: "bg-green-100 text-green-800 border-green-200",
  refuse: "bg-red-100 text-red-800 border-red-200",
}

const STATUS_LABEL: Record<AdminDossierStatus, string> = {
  en_preparation: "En préparation",
  depose: "Déposé",
  en_instruction: "En instruction",
  obtenu: "Obtenu",
  refuse: "Refusé",
}

type DossierRow = {
  id: string
  type: AdminDossierType
  label: string | null
  status: AdminDossierStatus
  deadline: string
  project: { id: string; name: string } | null
  days: number
}

function DeadlineBadge({ days }: { days: number }) {
  if (days < 0)
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-800 text-white">
        Expiré
      </span>
    )
  if (days === 0)
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500 text-white">
        {"Aujourd'hui"}
      </span>
    )
  if (days <= 7)
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500 text-white">
        J-{days}
      </span>
    )
  if (days <= 30)
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-500 text-white">
        J-{days}
      </span>
    )
  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-semibold bg-green-500 text-white">
      J-{days}
    </span>
  )
}

function DossierRow({ d }: { d: DossierRow }) {
  const typeLabel = d.type === "autre" && d.label ? d.label : TYPE_LABEL[d.type]
  const formattedDate = new Date(d.deadline + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <Link
      href={`/projects/${d.project?.id}?highlight=dossier_${d.id}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors group"
    >
      <DeadlineBadge days={d.days} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{typeLabel}</p>
        <p className="text-xs text-muted-foreground truncate">{d.project?.name ?? "—"}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
        <span
          className={cn(
            "hidden md:inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium",
            STATUS_CLASS[d.status]
          )}
        >
          {STATUS_LABEL[d.status]}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  )
}

function Section({ title, rows, accent }: { title: string; rows: DossierRow[]; accent?: string }) {
  if (rows.length === 0) return null
  return (
    <div>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wide px-4 py-2",
          accent ?? "text-muted-foreground"
        )}
      >
        {title} — {rows.length}
      </p>
      <div className="divide-y divide-border border rounded-lg overflow-hidden bg-card">
        {rows.map((d) => (
          <DossierRow key={d.id} d={d} />
        ))}
      </div>
    </div>
  )
}

export default async function DeadlinesPage() {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const supabase = await createClient()

  const { data } = await supabase
    .from("admin_dossiers")
    .select("id, type, label, status, deadline, project:projects(id, name)")
    .not("status", "in", "(obtenu,refuse)")
    .not("deadline", "is", null)
    .order("deadline", { ascending: true })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const rows: DossierRow[] = (data ?? []).map((d) => ({
    ...d,
    project: (Array.isArray(d.project) ? d.project[0] : d.project) as {
      id: string
      name: string
    } | null,
    days: differenceInDays(parseISO(d.deadline!), today),
  }))

  const expired = rows.filter((d) => d.days < 0)
  const urgent = rows.filter((d) => d.days >= 0 && d.days <= 7)
  const attention = rows.filter((d) => d.days > 7 && d.days <= 30)
  const ok = rows.filter((d) => d.days > 30)

  const totalUrgent = expired.length + urgent.length

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 max-w-2xl space-y-8">
        {/* Header */}
        <FadeIn>
          <h1 className="text-2xl font-bold tracking-tight">Échéances</h1>
          <p className="text-muted-foreground">
            {rows.length === 0
              ? "Aucune échéance à surveiller"
              : totalUrgent > 0
                ? `${totalUrgent} échéance${totalUrgent > 1 ? "s" : ""} urgente${totalUrgent > 1 ? "s" : ""}`
                : `${rows.length} échéance${rows.length > 1 ? "s" : ""} à venir`}
          </p>
        </FadeIn>

        {/* Empty state */}
        {rows.length === 0 && (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <CalendarCheck className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="font-medium">Aucune échéance enregistrée</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des dossiers administratifs avec une date limite depuis vos projets.
              </p>
            </div>
          </FadeIn>
        )}

        {/* Groupes */}
        <FadeIn delay={0.1}>
          <div className="space-y-6">
            <Section title="Expirés" rows={expired} accent="text-gray-700 dark:text-gray-300" />
            <Section
              title="Urgents — ≤ 7 jours"
              rows={urgent}
              accent="text-red-600 dark:text-red-400"
            />
            <Section
              title="Attention — 7 à 30 jours"
              rows={attention}
              accent="text-amber-600 dark:text-amber-400"
            />
            <Section
              title="OK — > 30 jours"
              rows={ok}
              accent="text-green-600 dark:text-green-500"
            />
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
