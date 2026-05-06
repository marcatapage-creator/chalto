import React from "react"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { redirect, notFound } from "next/navigation"
import type { Metadata } from "next"
import type { SituationStatus } from "@/types/domain"
import { PrintButton } from "./print-button"

export const metadata: Metadata = { title: "Récapitulatif situations" }

const STATUS_LABEL: Record<SituationStatus, string> = {
  en_attente: "En attente",
  validee: "Validée",
  refusee: "Refusée",
  corrigee: "Corrigée (en attente)",
}

export default async function SituationsPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const supabase = await createClient()

  const [{ data: project }, { data: situations }] = await Promise.all([
    supabase
      .from("projects")
      .select("name, client_name, address")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("situations")
      .select(
        "id, lot_label, percentage, amount_ht, comment, status, refusal_reason, reviewer_comment, submitted_at, reviewed_at, contributor:contributors(name)"
      )
      .eq("project_id", id)
      .order("submitted_at", { ascending: false })
      .limit(500),
  ])

  if (!project) notFound()

  const grouped = (situations ?? []).reduce<Record<string, typeof situations>>((acc, s) => {
    if (!s) return acc
    const name = (s.contributor as { name?: string } | null)?.name ?? "Inconnu"
    acc[name] = [...(acc[name] ?? []), s]
    return acc
  }, {})

  const printedAt = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <>
      <PrintButton />

      <div className="max-w-3xl mx-auto px-6 py-10 print:p-0 print:max-w-none font-sans text-sm text-gray-900">
        {/* En-tête */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
            Récapitulatif situations de travaux
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.client_name && (
            <p className="text-sm text-gray-500 mt-1">Client : {project.client_name}</p>
          )}
          {project.address && <p className="text-sm text-gray-500">{project.address}</p>}
          <p className="text-xs text-gray-400 mt-3">Édité le {printedAt}</p>
        </div>

        {(situations ?? []).length === 0 ? (
          <p className="text-gray-500 italic">Aucune situation soumise sur ce projet.</p>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([contributorName, rows]) => (
              <div key={contributorName}>
                <h2 className="text-base font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">
                  {contributorName}
                </h2>
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="pb-2 pr-4 font-medium">Lot</th>
                      <th className="pb-2 pr-4 font-medium text-right">%</th>
                      <th className="pb-2 pr-4 font-medium text-right">Montant HT</th>
                      <th className="pb-2 pr-4 font-medium">Statut</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rows ?? []).map((s) => (
                      <React.Fragment key={s!.id}>
                        <tr className="border-b border-gray-100 align-top">
                          <td className="py-2 pr-4 font-medium">{s!.lot_label}</td>
                          <td className="py-2 pr-4 text-right">{s!.percentage}%</td>
                          <td className="py-2 pr-4 text-right">
                            {s!.amount_ht
                              ? s!.amount_ht.toLocaleString("fr-FR", {
                                  minimumFractionDigits: 0,
                                }) + " €"
                              : "—"}
                          </td>
                          <td className="py-2 pr-4">
                            <span
                              className={
                                s!.status === "validee"
                                  ? "text-green-700 font-medium"
                                  : s!.status === "refusee"
                                    ? "text-red-700 font-medium"
                                    : "text-gray-600"
                              }
                            >
                              {STATUS_LABEL[s!.status as SituationStatus]}
                            </span>
                          </td>
                          <td className="py-2 text-gray-500">
                            {new Date(s!.submitted_at).toLocaleDateString("fr-FR")}
                          </td>
                        </tr>
                        {(s!.comment || s!.refusal_reason || s!.reviewer_comment) && (
                          <tr className="border-b border-gray-100">
                            <td colSpan={5} className="pb-3 pt-0 pl-2">
                              {s!.comment && (
                                <p className="text-xs text-gray-500 italic">
                                  Commentaire : {s!.comment}
                                </p>
                              )}
                              {s!.refusal_reason && (
                                <p className="text-xs text-red-600">
                                  Motif de refus : {s!.refusal_reason}
                                </p>
                              )}
                              {s!.reviewer_comment && (
                                <p className="text-xs text-gray-600">
                                  Commentaire architecte : {s!.reviewer_comment}
                                </p>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400 flex justify-between print:mt-8">
          <span>Chalto — gestion de chantier</span>
          <span>{printedAt}</span>
        </div>
      </div>
    </>
  )
}
