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
import { Mail, Smartphone } from "lucide-react"

interface NotificationsFormProps {
  profile: {
    id: string
    notif_email_approved: boolean | null | undefined
    notif_email_rejected: boolean | null | undefined
    notif_email_message: boolean | null | undefined
    notif_email_task: boolean | null | undefined
    notif_email_frequency: string | null | undefined
    notif_inapp_enabled: boolean | null | undefined
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
  never: "Aucun email — consultez la cloche pour vos notifications.",
}

export function NotificationsForm({ profile }: NotificationsFormProps) {
  const [form, setForm] = useState({
    notif_email_approved: profile.notif_email_approved !== false,
    notif_email_rejected: profile.notif_email_rejected !== false,
    notif_email_message: profile.notif_email_message !== false,
    notif_email_task: profile.notif_email_task !== false,
    notif_email_frequency: ["immediate", "never"].includes(profile.notif_email_frequency ?? "")
      ? (profile.notif_email_frequency ?? "immediate")
      : "immediate",
    notif_inapp_enabled: profile.notif_inapp_enabled !== false,
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
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immédiatement — dès que ça se passe</SelectItem>
                <SelectItem value="never">Jamais — notifications in-app uniquement</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {frequencyHints[form.notif_email_frequency]}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-10 bg-background border-t pt-3 pb-4 -mx-6 px-6 sm:static sm:border-0 sm:pt-0 sm:pb-0 sm:mx-0 sm:px-0">
        <Button onClick={handleSave} loading={saving} className="w-full">
          {saving ? "Sauvegarde..." : "Sauvegarder les préférences"}
        </Button>
      </div>
    </div>
  )
}
