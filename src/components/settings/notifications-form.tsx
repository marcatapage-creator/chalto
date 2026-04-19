"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Bell, Mail, Smartphone } from "lucide-react"

interface NotificationsFormProps {
  profile: {
    id: string
    notif_email_approved: boolean
    notif_email_rejected: boolean
    notif_email_message: boolean
    notif_email_task: boolean
    notif_email_frequency: string
    notif_inapp_enabled: boolean
  }
}

const emailItems = [
  {
    id: "notif_email_approved",
    label: "Document approuvé",
    description: "Quand un client ou prestataire approuve un document",
  },
  {
    id: "notif_email_rejected",
    label: "Document refusé",
    description: "Quand un client ou prestataire refuse un document",
  },
  {
    id: "notif_email_message",
    label: "Nouveau message chantier",
    description: "Quand un prestataire envoie un message sur un chantier",
  },
  {
    id: "notif_email_task",
    label: "Nouvelle tâche assignée",
    description: "Quand une tâche vous est assignée",
  },
]

const frequencyHints: Record<string, string> = {
  immediate: "Vous recevez un email à chaque événement.",
  daily: "Un résumé de vos notifications est envoyé chaque soir à 18h.",
  weekly: "Un résumé hebdomadaire est envoyé chaque lundi matin.",
  never: "Aucun email — consultez la cloche pour vos notifications.",
}

export function NotificationsForm({ profile }: NotificationsFormProps) {
  const [form, setForm] = useState({
    notif_email_approved: profile.notif_email_approved ?? true,
    notif_email_rejected: profile.notif_email_rejected ?? true,
    notif_email_message: profile.notif_email_message ?? true,
    notif_email_task: profile.notif_email_task ?? true,
    notif_email_frequency: profile.notif_email_frequency ?? "immediate",
    notif_inapp_enabled: profile.notif_inapp_enabled ?? true,
  })
  const [saving, setSaving] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const updateField = (field: string, value: boolean | string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from("profiles").update(form).eq("id", profile.id)
    if (error) {
      toast.error("Erreur lors de la sauvegarde")
    } else {
      toast.success("Préférences sauvegardées ✅")
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Notifications in-app */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            Notifications in-app
          </CardTitle>
          <CardDescription>
            Les notifications qui apparaissent dans la cloche en haut de l&apos;écran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif_inapp_enabled" className="text-sm">
              Activer les notifications in-app
            </Label>
            <Switch
              id="notif_inapp_enabled"
              checked={form.notif_inapp_enabled}
              onCheckedChange={(v) => updateField("notif_inapp_enabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications email */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Notifications email
          </CardTitle>
          <CardDescription>
            Choisissez les événements pour lesquels vous recevez un email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailItems.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor={item.id} className="text-sm font-medium">
                  {item.label}
                </Label>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                id={item.id}
                checked={form[item.id as keyof typeof form] as boolean}
                onCheckedChange={(v) => updateField(item.id, v)}
              />
            </div>
          ))}

          <div className="pt-2 border-t space-y-2">
            <Label className="text-sm font-medium">Fréquence des emails</Label>
            <Select
              value={form.notif_email_frequency}
              onValueChange={(v) => updateField("notif_email_frequency", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immédiatement — dès que ça se passe</SelectItem>
                <SelectItem value="daily">Résumé quotidien — 1 email par jour max</SelectItem>
                <SelectItem value="weekly">Résumé hebdomadaire — 1 email par semaine</SelectItem>
                <SelectItem value="never">Jamais — notifications in-app uniquement</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {frequencyHints[form.notif_email_frequency]}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Bell className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Les notifications importantes (document refusé, validation urgente) sont toujours
              envoyées immédiatement, quelle que soit la fréquence choisie.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} loading={saving}>
        {saving ? "Sauvegarde..." : "Sauvegarder les préférences"}
      </Button>
    </div>
  )
}
