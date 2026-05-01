import { SupabaseClient } from "@supabase/supabase-js"

export async function createDemoProject(
  supabase: SupabaseClient,
  userId: string,
  professionSlug: string
) {
  const demoContent: Record<
    string,
    {
      projectName: string
      clientName: string
      clientEmail: string
      address: string
      description: string
      documentName: string
      documentType: string
      workType: string
    }
  > = {
    architecte_interieur: {
      projectName: "🛋️ Projet démo — Appartement Lefèvre",
      clientName: "Camille Lefèvre",
      clientEmail: "demo@chalto.fr",
      address: "18 rue du Faubourg Saint-Antoine, 75011 Paris",
      description: "Aménagement complet d'un appartement de 75m² — ambiance contemporaine",
      documentName: "Book de projet — Planches d'ambiance",
      documentType: "Notice",
      workType: "Aménagement d'espace",
    },
    architecte: {
      projectName: "🏠 Projet démo — Rénovation Dupont",
      clientName: "Marie Dupont",
      clientEmail: "demo@chalto.fr",
      address: "12 rue de la Paix, 75001 Paris",
      description: "Rénovation complète d'un appartement haussmannien de 120m²",
      documentName: "Plan RDC — Version 1",
      documentType: "Plan",
      workType: "Rénovation complète",
    },
    plombier: {
      projectName: "🔧 Projet démo — Salle de bain Martin",
      clientName: "Jean Martin",
      clientEmail: "demo@chalto.fr",
      address: "8 avenue Victor Hugo, 69001 Lyon",
      description: "Rénovation complète salle de bain avec douche à l'italienne",
      documentName: "Devis rénovation salle de bain",
      documentType: "Devis",
      workType: "Rénovation salle de bain",
    },
    electricien: {
      projectName: "⚡ Projet démo — Mise aux normes Bernard",
      clientName: "Paul Bernard",
      clientEmail: "demo@chalto.fr",
      address: "3 rue des Fleurs, 33000 Bordeaux",
      description: "Mise aux normes tableau électrique et installation domotique",
      documentName: "Devis mise aux normes électrique",
      documentType: "Devis",
      workType: "Mise aux normes",
    },
    menuisier: {
      projectName: "🪟 Projet démo — Cuisine Moreau",
      clientName: "Sophie Moreau",
      clientEmail: "demo@chalto.fr",
      address: "15 boulevard Gambetta, 31000 Toulouse",
      description: "Fabrication et pose d'une cuisine sur mesure",
      documentName: "Bon de commande cuisine",
      documentType: "Bon de commande",
      workType: "Cuisine",
    },
    entrepreneur: {
      projectName: "🏗️ Projet démo — Extension Petit",
      clientName: "Marc Petit",
      clientEmail: "demo@chalto.fr",
      address: "22 chemin des Roses, 13001 Marseille",
      description: "Extension de maison individuelle — 40m² supplémentaires",
      documentName: "DPGF — Lot gros œuvre",
      documentType: "DPGF",
      workType: "Extension",
    },
  }

  const content = demoContent[professionSlug] ?? demoContent.architecte

  const { data: profession } = await supabase
    .from("professions")
    .select("id")
    .eq("slug", professionSlug)
    .single()

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      name: content.projectName,
      client_name: content.clientName,
      client_email: content.clientEmail,
      address: content.address,
      description: content.description,
      work_type: content.workType,
      status: "active",
      phase: "conception",
      profession_id: profession?.id ?? null,
    })
    .select()
    .single()

  if (projectError || !project) return null

  await supabase.from("documents").insert({
    project_id: project.id,
    name: content.documentName,
    type: content.documentType,
    status: "draft",
  })

  await supabase.from("profiles").update({ demo_project_id: project.id }).eq("id", userId)

  return project
}
