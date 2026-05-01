"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { NotificationsForm } from "@/components/settings/notifications-form"
import { BrandingForm } from "@/components/settings/branding-form"

interface Profession {
  id: string
  label: string
  slug: string
}

interface Profile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  phone?: string
  profession_id?: string
  professions?: Profession
}

export function SettingsForm({
  profile,
  professions,
  userProfessions = [],
  notifProfile,
  brandingProfile,
}: {
  profile: Profile
  professions: Profession[]
  userProfessions?: { id: string; label: string; slug: string }[]
  notifProfile: React.ComponentProps<typeof NotificationsForm>["profile"]
  brandingProfile: React.ComponentProps<typeof BrandingForm>["profile"]
}) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    profession_id: profile?.profession_id ?? "",
  })
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" })
      if (!res.ok) {
        toast.error("Erreur lors de la suppression du compte")
        return
      }
      await supabase.auth.signOut()
      router.push("/register")
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        profession_id: form.profession_id,
      })
      .eq("id", profile.id)

    if (error) {
      toast.error("Erreur lors de la sauvegarde")
    } else {
      toast.success("Profil mis à jour")
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Tabs defaultValue="profil" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="profil">Profil</TabsTrigger>
        <TabsTrigger value="entreprise">Entreprise</TabsTrigger>
        <TabsTrigger value="compte">Compte</TabsTrigger>
        <TabsTrigger value="notifications">Notifs</TabsTrigger>
      </TabsList>

      {/* Onglet Profil */}
      <TabsContent value="profil" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Ces informations apparaissent sur vos documents et liens clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input
                name="full_name"
                placeholder="Jean Dupont"
                value={form.full_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled className="opacity-50" />
              <p className="text-xs text-muted-foreground">{"L'email ne peut pas être modifié"}</p>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                name="phone"
                placeholder="06 00 00 00 00"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Votre métier</CardTitle>
            <CardDescription>Détermine les templates et documents disponibles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userProfessions.length > 1 ? (
              <>
                <div className="space-y-2">
                  {userProfessions.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 bg-muted/40"
                    >
                      <span className="text-sm font-medium">{p.label}</span>
                      {p.id === form.profession_id && (
                        <span className="text-xs text-muted-foreground">Principal</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mode multi-métier actif. Pour modifier vos métiers,{" "}
                  <a
                    href="mailto:hello@chalto.fr"
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    contactez-nous
                  </a>
                  .
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border px-3 py-2 bg-muted/40">
                  <span className="text-sm font-medium">
                    {professions.find((p) => p.id === form.profession_id)?.label ?? "Non défini"}
                  </span>
                  <span className="text-xs text-muted-foreground">Verrouillé</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pour changer de métier ou accéder au mode multi-métier,{" "}
                  <a
                    href="mailto:hello@chalto.fr"
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    contactez-nous
                  </a>
                  .
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="sticky bottom-0 z-10 bg-background border-t pt-3 pb-4 -mx-6 px-6 sm:static sm:border-0 sm:pt-0 sm:pb-0 sm:mx-0 sm:px-0">
          <Button onClick={handleSave} loading={loading} className="w-full">
            {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </Button>
        </div>
      </TabsContent>

      {/* Onglet Entreprise */}
      <TabsContent value="entreprise">
        <BrandingForm profile={brandingProfile} />
      </TabsContent>

      {/* Onglet Compte */}
      <TabsContent value="compte" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Gérez votre mot de passe et la sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email actuel</Label>
              <Input value={profile.email} disabled className="opacity-50" />
            </div>
            <Button variant="outline" className="w-full" disabled>
              Changer le mot de passe (bientôt disponible)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
            <CardDescription>
              {"Ces actions sont irréversibles, procédez avec précaution"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" loading={deleting}>
                  {deleting ? "Suppression..." : "Supprimer mon compte"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer définitivement le compte ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Votre compte, vos projets et tous vos documents
                    seront supprimés définitivement.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Oui, supprimer mon compte
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Onglet Notifications */}
      <TabsContent value="notifications">
        <NotificationsForm profile={notifProfile} />
      </TabsContent>
    </Tabs>
  )
}
