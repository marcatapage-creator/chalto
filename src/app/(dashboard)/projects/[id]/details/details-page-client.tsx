"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { scrollOnFocus } from "@/hooks/use-scroll-on-focus"

const workTypes = [
  "Construction neuve",
  "Rénovation complète",
  "Rénovation partielle",
  "Extension",
  "Aménagement intérieur",
  "Ravalement / façade",
  "Plomberie",
  "Électricité",
  "Menuiserie",
  "Autre",
]

const budgetRanges = [
  "< 10 000€",
  "10 000€ — 50 000€",
  "50 000€ — 150 000€",
  "150 000€ — 500 000€",
  "> 500 000€",
  "Non défini",
]

type Tab = "client" | "cadrage"

const TABS: { id: Tab; label: string }[] = [
  { id: "client", label: "Client" },
  { id: "cadrage", label: "Cadrage" },
]

const tabSlideVariants = {
  enter: (dir: number) => ({ x: `${dir * 25}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: `${dir * -15}%`, opacity: 0 }),
}

interface Project {
  id: string
  name: string
  phase: string | null
  client_name?: string | null
  client_email?: string | null
  address?: string | null
  description?: string | null
  work_type?: string | null
  budget_range?: string | null
  deadline?: string | null
  constraints?: string | null
}

interface DetailsPageClientProps {
  project: Project
}

export function DetailsPageClient({ project }: DetailsPageClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>("client")
  const [tabDir, setTabDir] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client_name: project.client_name ?? "",
    client_email: project.client_email ?? "",
    address: project.address ?? "",
    description: project.description ?? "",
    work_type: project.work_type ?? "",
    budget_range: project.budget_range ?? "",
    deadline: project.deadline ?? "",
    constraints: project.constraints ?? "",
  })

  const navigateTab = (t: Tab) => {
    setTabDir(t === "cadrage" ? 1 : -1)
    setTab(t)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from("projects")
      .update({
        client_name: form.client_name || null,
        client_email: form.client_email || null,
        address: form.address || null,
        description: form.description || null,
        work_type: form.work_type || null,
        budget_range: form.budget_range || null,
        deadline: form.deadline || null,
        constraints: form.constraints || null,
      })
      .eq("id", project.id)

    if (error) {
      toast.error("Erreur lors de la sauvegarde")
    } else {
      toast.success("Projet mis à jour")
      router.push(`/projects/${project.id}`)
      router.refresh()
    }
    setSaving(false)
  }

  const activeIndex = TABS.findIndex((t) => t.id === tab)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3 bg-popover">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Détails du projet</p>
          <p className="text-xs text-muted-foreground truncate">{project.name}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="relative flex shrink-0 border-b bg-popover">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => navigateTab(t.id)}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-colors",
              tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
        <motion.div
          className="absolute -bottom-px h-0.5 bg-primary"
          animate={{ left: `${(activeIndex / TABS.length) * 100}%` }}
          style={{ width: `${100 / TABS.length}%` }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait" initial={false} custom={tabDir}>
            <motion.div
              key={tab}
              custom={tabDir}
              variants={tabSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
              className="px-4 py-6 space-y-4"
            >
              {tab === "client" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nom</Label>
                      <Input
                        placeholder="Jean Dupont"
                        value={form.client_name}
                        onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                        onFocus={scrollOnFocus}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        placeholder="jean@exemple.fr"
                        value={form.client_email}
                        onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                        onFocus={scrollOnFocus}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Adresse du chantier</Label>
                    <Input
                      placeholder="12 rue de la Paix, 75001 Paris"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      onFocus={scrollOnFocus}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Notes</Label>
                    <Textarea
                      placeholder="Description ou notes sur le projet..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      onFocus={scrollOnFocus}
                      className="min-h-24 resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Type de travaux</Label>
                    <div className="flex flex-wrap gap-2">
                      {workTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, work_type: form.work_type === type ? "" : type })
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs border transition-all duration-150 max-sm:h-11 max-sm:py-0",
                            form.work_type === type
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50 hover:bg-muted"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Budget estimé</Label>
                    <div className="flex flex-wrap gap-2">
                      {budgetRanges.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              budget_range: form.budget_range === range ? "" : range,
                            })
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs border transition-all duration-150 max-sm:h-11 max-sm:py-0",
                            form.budget_range === range
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50 hover:bg-muted"
                          )}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Délai souhaité</Label>
                    <Input
                      placeholder="Ex: Fin du T2 2026..."
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      onFocus={scrollOnFocus}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Contraintes</Label>
                    <Textarea
                      placeholder="Ex: Bâtiment classé..."
                      value={form.constraints}
                      onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                      onFocus={scrollOnFocus}
                      className="min-h-20 resize-none"
                    />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer fixe */}
      <div className="shrink-0 border-t px-4 py-4 bg-popover">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button className="flex-1" onClick={handleSave} loading={saving}>
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  )
}
