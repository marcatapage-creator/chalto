import {
  ClipboardList,
  Pencil,
  CheckSquare,
  HardHat,
  Search,
  Archive,
  Lightbulb,
  Paintbrush,
  Eye,
  UserPlus,
  ListTodo,
  MessageSquare,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ProjectPhase } from "@/types"

export interface PhaseConfig {
  id: ProjectPhase
  label: string
  icon: LucideIcon
}

export interface ChantierItem {
  icon: LucideIcon
  title: string
  description: string
}

export interface ProfessionConfig {
  phases: PhaseConfig[]
  workTypes: string[]
  budgetRanges: string[]
  chantierDialog: {
    title: string
    description: string
    items: ChantierItem[]
  }
  chantierBlockedToast: string
  stepperTooltip: string
}

const BASE_PHASES: PhaseConfig[] = [
  { id: "cadrage", label: "Cadrage", icon: ClipboardList },
  { id: "conception", label: "Conception", icon: Pencil },
  { id: "validation", label: "Validation", icon: CheckSquare },
  { id: "chantier", label: "Chantier", icon: HardHat },
  { id: "reception", label: "Réception", icon: Search },
  { id: "cloture", label: "Clôturé", icon: Archive },
]

const GENERIC_CHANTIER_ITEMS: ChantierItem[] = [
  {
    icon: UserPlus,
    title: "Inviter vos prestataires",
    description: "Ajoutez les intervenants du chantier pour leur donner accès au projet.",
  },
  {
    icon: ListTodo,
    title: "Tâches",
    description:
      "Créez des tâches et affectez-les à vos prestataires pour suivre l'avancement du chantier.",
  },
  {
    icon: MessageSquare,
    title: "Fil de discussion chantier",
    description:
      "Échangez directement avec vos prestataires via un fil de conversation dédié à ce chantier.",
  },
]

const CONFIGS: Record<string, ProfessionConfig> = {
  architecte: {
    phases: BASE_PHASES,
    workTypes: [
      "Construction neuve",
      "Rénovation complète",
      "Rénovation partielle",
      "Extension",
      "Aménagement intérieur",
      "Ravalement / façade",
      "Autre",
    ],
    budgetRanges: [
      "< 10 000€",
      "10 000€ — 50 000€",
      "50 000€ — 150 000€",
      "150 000€ — 500 000€",
      "> 500 000€",
      "Non défini",
    ],
    chantierDialog: {
      title: "Phase Chantier débloquée",
      description: "Vous entrez en phase chantier. Voici ce que vous pouvez faire maintenant :",
      items: GENERIC_CHANTIER_ITEMS,
    },
    chantierBlockedToast: "Retour impossible : le chantier est déjà amorcé.",
    stepperTooltip:
      "Suivez l'avancement de votre projet de la conception à la réception — phase par phase.",
  },

  architecte_interieur: {
    phases: [
      { id: "cadrage", label: "Brief", icon: Lightbulb },
      { id: "conception", label: "Conception", icon: Pencil },
      { id: "validation", label: "Validation", icon: CheckSquare },
      { id: "chantier", label: "Réalisation", icon: Paintbrush },
      { id: "reception", label: "Livraison", icon: Eye },
      { id: "cloture", label: "Clôturé", icon: Archive },
    ],
    workTypes: [
      "Rénovation & décoration",
      "Aménagement d'espace",
      "Design d'intérieur complet",
      "Architecture commerciale / retail",
      "Home staging",
      "Rénovation partielle",
      "Décoration seule",
      "Autre",
    ],
    budgetRanges: [
      "< 5 000€",
      "5 000€ — 20 000€",
      "20 000€ — 80 000€",
      "80 000€ — 250 000€",
      "> 250 000€",
      "Non défini",
    ],
    chantierDialog: {
      title: "Phase Réalisation débloquée",
      description: "Vous entrez en phase réalisation. Voici ce que vous pouvez faire maintenant :",
      items: [
        {
          icon: UserPlus,
          title: "Inviter vos artisans",
          description: "Ajoutez les artisans et poseurs intervenant sur ce projet.",
        },
        {
          icon: ListTodo,
          title: "Tâches",
          description:
            "Créez des tâches et affectez-les à vos artisans pour suivre l'avancement de la réalisation.",
        },
        {
          icon: MessageSquare,
          title: "Fil de discussion réalisation",
          description: "Échangez directement avec vos artisans via un fil de conversation dédié.",
        },
      ],
    },
    chantierBlockedToast: "Retour impossible : la réalisation est déjà amorcée.",
    stepperTooltip:
      "Suivez l'avancement de votre projet du brief à la livraison — phase par phase.",
  },

  plombier: {
    phases: [
      { id: "cadrage", label: "Diagnostic", icon: ClipboardList },
      { id: "conception", label: "Étude", icon: Pencil },
      { id: "validation", label: "Devis validé", icon: CheckSquare },
      { id: "chantier", label: "Chantier", icon: HardHat },
      { id: "reception", label: "Mise en service", icon: Search },
      { id: "cloture", label: "Clôturé", icon: Archive },
    ],
    workTypes: [
      "Rénovation salle de bain",
      "Installation sanitaire",
      "Chauffage / chaudière",
      "Dépannage",
      "Mise aux normes",
      "Autre",
    ],
    budgetRanges: [
      "< 2 000€",
      "2 000€ — 10 000€",
      "10 000€ — 30 000€",
      "30 000€ — 80 000€",
      "> 80 000€",
      "Non défini",
    ],
    chantierDialog: {
      title: "Phase Chantier débloquée",
      description: "Vous entrez en phase chantier. Voici ce que vous pouvez faire maintenant :",
      items: GENERIC_CHANTIER_ITEMS,
    },
    chantierBlockedToast: "Retour impossible : le chantier est déjà amorcé.",
    stepperTooltip:
      "Suivez l'avancement de votre chantier du diagnostic à la mise en service — phase par phase.",
  },

  electricien: {
    phases: [
      { id: "cadrage", label: "Diagnostic", icon: ClipboardList },
      { id: "conception", label: "Étude", icon: Pencil },
      { id: "validation", label: "Devis validé", icon: CheckSquare },
      { id: "chantier", label: "Chantier", icon: HardHat },
      { id: "reception", label: "Mise en service", icon: Search },
      { id: "cloture", label: "Clôturé", icon: Archive },
    ],
    workTypes: [
      "Mise aux normes tableau",
      "Installation domotique",
      "Éclairage",
      "Câblage réseau",
      "Dépannage",
      "Autre",
    ],
    budgetRanges: [
      "< 1 000€",
      "1 000€ — 5 000€",
      "5 000€ — 20 000€",
      "20 000€ — 50 000€",
      "> 50 000€",
      "Non défini",
    ],
    chantierDialog: {
      title: "Phase Chantier débloquée",
      description: "Vous entrez en phase chantier. Voici ce que vous pouvez faire maintenant :",
      items: GENERIC_CHANTIER_ITEMS,
    },
    chantierBlockedToast: "Retour impossible : le chantier est déjà amorcé.",
    stepperTooltip:
      "Suivez l'avancement de votre chantier du diagnostic à la mise en service — phase par phase.",
  },

  menuisier: {
    phases: [
      { id: "cadrage", label: "Cadrage", icon: ClipboardList },
      { id: "conception", label: "Plans & modélisation", icon: Pencil },
      { id: "validation", label: "Validation", icon: CheckSquare },
      { id: "chantier", label: "Fabrication & pose", icon: HardHat },
      { id: "reception", label: "Réception", icon: Search },
      { id: "cloture", label: "Clôturé", icon: Archive },
    ],
    workTypes: [
      "Cuisine sur mesure",
      "Dressing / rangements",
      "Menuiseries extérieures",
      "Escalier",
      "Agencement commercial",
      "Autre",
    ],
    budgetRanges: [
      "< 3 000€",
      "3 000€ — 15 000€",
      "15 000€ — 50 000€",
      "50 000€ — 150 000€",
      "> 150 000€",
      "Non défini",
    ],
    chantierDialog: {
      title: "Phase Fabrication & pose débloquée",
      description:
        "Vous entrez en phase fabrication et pose. Voici ce que vous pouvez faire maintenant :",
      items: [
        {
          icon: UserPlus,
          title: "Inviter vos poseurs",
          description: "Ajoutez les poseurs intervenant sur ce chantier.",
        },
        {
          icon: ListTodo,
          title: "Tâches",
          description: "Créez des tâches pour suivre la fabrication et la pose.",
        },
        {
          icon: MessageSquare,
          title: "Fil de discussion chantier",
          description: "Échangez directement avec vos poseurs.",
        },
      ],
    },
    chantierBlockedToast: "Retour impossible : la fabrication est déjà amorcée.",
    stepperTooltip:
      "Suivez l'avancement de votre projet du cadrage à la réception — phase par phase.",
  },

  entrepreneur: {
    phases: BASE_PHASES,
    workTypes: [
      "Construction neuve",
      "Extension",
      "Rénovation lourde",
      "Gros œuvre",
      "Second œuvre",
      "Autre",
    ],
    budgetRanges: [
      "< 50 000€",
      "50 000€ — 200 000€",
      "200 000€ — 500 000€",
      "500 000€ — 2 000 000€",
      "> 2 000 000€",
      "Non défini",
    ],
    chantierDialog: {
      title: "Phase Chantier débloquée",
      description: "Vous entrez en phase chantier. Voici ce que vous pouvez faire maintenant :",
      items: GENERIC_CHANTIER_ITEMS,
    },
    chantierBlockedToast: "Retour impossible : le chantier est déjà amorcé.",
    stepperTooltip:
      "Suivez l'avancement de votre projet de la conception à la réception — phase par phase.",
  },
}

export function getProfessionConfig(slug?: string | null): ProfessionConfig {
  return CONFIGS[slug ?? "architecte"] ?? CONFIGS.architecte
}
