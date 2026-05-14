"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { fetchWithTimeout } from "@/lib/fetch-timeout"
import { scrollOnFocus } from "@/hooks/use-scroll-on-focus"
import type { AdminDossierType, AdminDossierStatus } from "@/types/domain"

const TYPE_LABEL: Record<AdminDossierType, string> = {
  permis_construire: "Permis de construire",
  declaration_prealable: "Déclaration préalable",
  doc: "DOC",
  daact: "DAACT",
  erp: "ERP",
  autre: "Autre",
}

const STATUS_LABEL: Record<AdminDossierStatus, string> = {
  en_preparation: "En préparation",
  depose: "Déposé",
  en_instruction: "En instruction",
  obtenu: "Obtenu",
  refuse: "Refusé",
}

interface AdminDossierNewPageClientProps {
  project: { id: string; name: string }
}

export function AdminDossierNewPageClient({ project }: AdminDossierNewPageClientProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    type: "permis_construire" as AdminDossierType,
    label: "",
    status: "en_preparation" as AdminDossierStatus,
    deadline: "",
    notes: "",
  })

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetchWithTimeout("/api/admin-dossiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          type: form.type,
          label: form.type === "autre" ? form.label || null : null,
          status: form.status,
          deadline: form.deadline || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error((data as { error?: string }).error ?? "Erreur lors de la création")
        return
      }
      const { dossier } = await res.json()
      new BroadcastChannel("chalto:deadlines").postMessage({ type: "refresh" })
      toast.success("Dossier ajouté")
      router.push(`/projects/${project.id}?highlight=dossier_${dossier.id}`)
      router.refresh()
    } catch {
      toast.error("Erreur réseau — réessayez")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3 bg-popover">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Nouveau dossier administratif</p>
          <p className="text-xs text-muted-foreground truncate">{project.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Type de dossier</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as AdminDossierType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABEL) as AdminDossierType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.type === "autre" && (
            <div className="space-y-1.5">
              <Label>Préciser</Label>
              <Input
                maxLength={100}
                value={form.label}
                onFocus={scrollOnFocus}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Ex: Autorisation d'enseigne"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as AdminDossierStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as AdminDossierStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Échéance <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Input
                type="date"
                value={form.deadline}
                onFocus={scrollOnFocus}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              Notes <span className="font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <Textarea
              value={form.notes}
              onFocus={scrollOnFocus}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Références, contacts instructeur…"
              rows={3}
              maxLength={1000}
              className="resize-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t px-4 py-3 bg-popover flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button className="flex-1" onClick={handleSubmit} loading={submitting}>
          {submitting ? "Ajout..." : "Ajouter"}
        </Button>
      </div>
    </motion.div>
  )
}
