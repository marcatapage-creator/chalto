"use client"

import React, { useState, useRef, useCallback } from "react"
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
import { IntegrationsForm, type DropboxIntegration } from "@/components/settings/integrations-form"
import { Badge } from "@/components/ui/badge"
import { UpgradeModal } from "@/components/dashboard/upgrade-modal"
import { PLAN_LABEL, PLAN_LIMITS, type Plan } from "@/types/index"
import { Check, RefreshCw, Zap } from "lucide-react"

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

function BillingCard({
  plan,
  successPlan,
  canceled,
  upgradeOpen,
  setUpgradeOpen,
  portalLoading,
  setPortalLoading,
}: {
  plan: string
  successPlan?: string | null
  canceled?: boolean
  upgradeOpen: boolean
  setUpgradeOpen: (v: boolean) => void
  portalLoading: boolean
  setPortalLoading: (v: boolean) => void
}) {
  const effectivePlan = (successPlan ?? plan) as Plan
  const isPaid = effectivePlan !== "free"
  const limits = PLAN_LIMITS[effectivePlan] ?? PLAN_LIMITS["free"]

  const handlePortal = async () => {
    setPortalLoading(true)
    const res = await fetch("/api/stripe/portal", { method: "POST" })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setPortalLoading(false)
  }

  return (
    <>
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />

      {successPlan && (
        <div className="rounded-lg border border-green-400/60 bg-green-50/60 dark:bg-green-950/30 px-4 py-3 text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          Bienvenue sur l&apos;offre{" "}
          <strong>{PLAN_LABEL[successPlan as Plan] ?? successPlan}</strong> ! Votre compte a été mis
          à jour.
        </div>
      )}

      {canceled && (
        <div className="rounded-lg border border-amber-400/60 bg-amber-50/60 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          Le paiement a été annulé. Votre offre gratuite reste active.
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Abonnement</CardTitle>
            <Badge variant={isPaid ? "default" : "secondary"}>
              {PLAN_LABEL[effectivePlan] ?? plan}
            </Badge>
          </div>
          <CardDescription>Votre offre Chalto actuelle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              {limits.maxActiveProjects === Infinity
                ? "Projets actifs illimités"
                : `${limits.maxActiveProjects} projet actif`}
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              {limits.maxAiDocsPerMonth === Infinity
                ? "Génération IA illimitée"
                : `${limits.maxAiDocsPerMonth} générations IA / mois`}
            </li>
          </ul>

          {!isPaid ? (
            <Button className="gap-2" onClick={() => setUpgradeOpen(true)}>
              <Zap className="h-4 w-4" />
              Passer à Solo — 29€/mois
            </Button>
          ) : (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handlePortal}
              disabled={portalLoading}
            >
              <RefreshCw className={portalLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Gérer mon abonnement
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export function SettingsForm({
  profile,
  professions,
  userProfessions = [],
  notifProfile,
  brandingProfile,
  defaultTab,
  dropboxIntegration,
  integrationError,
  plan = "free",
  successPlan = null,
  canceled = false,
}: {
  profile: Profile
  professions: Profession[]
  userProfessions?: { id: string; label: string; slug: string }[]
  notifProfile: React.ComponentProps<typeof NotificationsForm>["profile"]
  brandingProfile: React.ComponentProps<typeof BrandingForm>["profile"]
  defaultTab?: string
  dropboxIntegration?: DropboxIntegration | null
  integrationError?: string | null
  plan?: string
  successPlan?: string | null
  canceled?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab ?? "profil")
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    requestAnimationFrame(() => {
      const container = scrollRef.current
      if (!container) return
      // Trouver par data-tab-value (stable, pas de race avec data-state)
      const active = container.querySelector<HTMLElement>(`[data-tab-value="${value}"]`)
      if (!active) return

      const next = active.nextElementSibling as HTMLElement | null
      const prev = active.previousElementSibling as HTMLElement | null

      // Peek l'onglet suivant s'il déborde à droite
      if (
        next &&
        next.offsetLeft + next.offsetWidth > container.scrollLeft + container.clientWidth
      ) {
        container.scrollTo({
          left: next.offsetLeft + next.offsetWidth - container.clientWidth + 8,
          behavior: "smooth",
        })
        return
      }

      // Peek l'onglet précédent s'il déborde à gauche
      if (prev && prev.offsetLeft < container.scrollLeft) {
        container.scrollTo({ left: prev.offsetLeft - 8, behavior: "smooth" })
        return
      }

      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
    })
  }, [])

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
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col gap-6">
      <div ref={scrollRef} className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <TabsList className="w-max">
          <TabsTrigger value="profil" className="shrink-0" data-tab-value="profil">
            Profil
          </TabsTrigger>
          <TabsTrigger value="entreprise" className="shrink-0" data-tab-value="entreprise">
            Entreprise
          </TabsTrigger>
          <TabsTrigger value="compte" className="shrink-0" data-tab-value="compte">
            Compte
          </TabsTrigger>
          <TabsTrigger value="notifications" className="shrink-0" data-tab-value="notifications">
            Notifs
          </TabsTrigger>
          <TabsTrigger value="integrations" className="shrink-0" data-tab-value="integrations">
            Intégrations
          </TabsTrigger>
        </TabsList>
      </div>

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
        <BillingCard
          plan={plan}
          successPlan={successPlan}
          canceled={canceled}
          upgradeOpen={upgradeOpen}
          setUpgradeOpen={setUpgradeOpen}
          portalLoading={portalLoading}
          setPortalLoading={setPortalLoading}
        />

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

      {/* Onglet Intégrations */}
      <TabsContent value="integrations">
        <IntegrationsForm
          dropboxIntegration={dropboxIntegration ?? null}
          error={integrationError}
        />
      </TabsContent>
    </Tabs>
  )
}
