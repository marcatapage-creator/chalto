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

const STATUS_COLOR: Record<SituationStatus, string> = {
  en_attente: "text-amber-700 bg-amber-50",
  validee: "text-green-700 bg-green-50",
  refusee: "text-red-700 bg-red-50",
  corrigee: "text-blue-700 bg-blue-50",
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
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <PrintButton />

      <div className="max-w-3xl mx-auto px-8 pt-24 pb-16 print:p-12 print:pt-8 print:max-w-none font-sans text-sm text-gray-900">
        {/* En-tête */}
        <div className="mb-12 pb-8 border-b-2 border-gray-900 print:mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">
            Récapitulatif situations de travaux
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.name}</h1>
          <div className="space-y-0.5">
            {project.client_name && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Client :</span> {project.client_name}
              </p>
            )}
            {project.address && <p className="text-sm text-gray-600">{project.address}</p>}
          </div>
          <p className="text-xs text-gray-400 mt-4">Édité le {printedAt}</p>
        </div>

        {(situations ?? []).length === 0 ? (
          <p className="text-gray-500 italic">Aucune situation soumise sur ce projet.</p>
        ) : (
          <div className="space-y-14 print:space-y-10">
            {Object.entries(grouped).map(([contributorName, rows]) => (
              <div key={contributorName}>
                {/* Titre section prestataire */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">
                      {contributorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{contributorName}</h2>
                </div>

                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="pb-3 pr-6 font-semibold">Lot</th>
                      <th className="pb-3 pr-6 font-semibold text-right">%</th>
                      <th className="pb-3 pr-6 font-semibold text-right">Montant HT</th>
                      <th className="pb-3 pr-6 font-semibold">Statut</th>
                      <th className="pb-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(rows ?? []).map((s) => (
                      <React.Fragment key={s!.id}>
                        <tr className="align-top">
                          <td className="py-4 pr-6 font-medium">{s!.lot_label}</td>
                          <td className="py-4 pr-6 text-right text-gray-700">{s!.percentage}%</td>
                          <td className="py-4 pr-6 text-right font-medium">
                            {s!.amount_ht
                              ? s!.amount_ht.toLocaleString("fr-FR", {
                                  minimumFractionDigits: 0,
                                }) + " €"
                              : "—"}
                          </td>
                          <td className="py-4 pr-6">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[s!.status as SituationStatus]}`}
                            >
                              {STATUS_LABEL[s!.status as SituationStatus]}
                            </span>
                          </td>
                          <td className="py-4 text-gray-500 text-xs">
                            {new Date(s!.submitted_at).toLocaleDateString("fr-FR")}
                          </td>
                        </tr>
                        {(s!.comment || s!.refusal_reason || s!.reviewer_comment) && (
                          <tr>
                            <td colSpan={5} className="pb-4 pt-0 pl-1">
                              <div className="bg-gray-50 rounded-md px-3 py-2.5 space-y-1 print:bg-transparent print:border print:border-gray-200">
                                {s!.comment && (
                                  <p className="text-xs text-gray-500 italic">
                                    <span className="not-italic font-medium text-gray-600">
                                      Commentaire :{" "}
                                    </span>
                                    {s!.comment}
                                  </p>
                                )}
                                {s!.refusal_reason && (
                                  <p className="text-xs text-red-600">
                                    <span className="font-medium">Motif de refus : </span>
                                    {s!.refusal_reason}
                                  </p>
                                )}
                                {s!.reviewer_comment && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">Note architecte : </span>
                                    {s!.reviewer_comment}
                                  </p>
                                )}
                              </div>
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

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-gray-200 text-xs text-gray-400 flex justify-between print:mt-10">
          <span>Chalto — gestion de chantier</span>
          <span>{printedAt}</span>
        </div>
      </div>
    </div>
  )
}
