"use client"

import { motion } from "framer-motion"

const features = [
  {
    num: "01",
    title: "Gestion documentaire intelligente",
    desc: "Upload, prévisualisation, statuts en temps réel (Brouillon → En attente → Validé). Vos clients valident en 1 clic depuis leur téléphone, sans créer de compte.",
    tags: ["DOCX", "Validation client", "Historique"],
  },
  {
    num: "02",
    title: "Génération IA de documents",
    desc: "CCTP, comptes-rendus de chantier, notices descriptives — générés par l'IA en quelques secondes à partir des informations du projet. Personnalisables, exportables.",
    tags: ["CCTP", "CR chantier", "IA intégrée"],
  },
  {
    num: "03",
    title: "Gestion des prestataires",
    desc: "Invitez vos sous-traitants et corps de métier par token sécurisé. Chacun accède uniquement à son périmètre. Fini les chaînes d'emails introuvables.",
    tags: ["Invitation sécurisée", "Accès limité"],
  },
  {
    num: "04",
    title: "Discussion chantier",
    desc: "Un fil de discussion par projet, séparé de vos emails. Architecte, client, prestataires — tout le monde au même endroit, avec historique complet.",
    tags: ["Multi-acteurs", "Temps réel"],
  },
  {
    num: "05",
    title: "Dossiers administratifs",
    desc: "Centralisez permis de construire, déclarations, assurances. Alertes automatiques avant chaque échéance. Plus aucune date critique ratée.",
    tags: ["Alertes J-30/15/7", "Permis"],
  },
  {
    num: "06",
    title: "Interface mobile optimisée",
    desc: "Chalto est conçu pour le terrain. L'interface s'adapte à tous les écrans, fonctionne sur iOS et Android, et reste utilisable même avec une connexion limitée. Mode sombre inclus.",
    tags: ["iOS & Android", "Mode sombre", "Responsive"],
  },
]

export function LandingFeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 md:px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Ce que fait Chalto
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Tout ce dont vous avez
            <br />
            besoin. Rien de plus.
          </h2>
          <p className="text-muted-foreground max-w-lg text-lg font-light leading-relaxed">
            Des fonctionnalités conçues avec de vrais architectes et artisans — pas des product
            managers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="group bg-card border border-border rounded-2xl p-7 flex flex-col gap-4 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
            >
              <p className="text-sm italic text-primary font-medium">{f.num}</p>
              <p className="font-semibold text-base text-foreground">{f.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {f.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/8 text-primary font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
