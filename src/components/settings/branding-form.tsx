"use client"

import { useState, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Upload, X, ImageIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import Image from "next/image"

interface BrandingFormProps {
  profile: {
    id: string
    logo_url?: string | null
    company_name?: string | null
    branding_enabled?: boolean | null
  }
}

export function BrandingForm({ profile }: BrandingFormProps) {
  const [logoUrl, setLogoUrl] = useState(profile.logo_url ?? null)
  const [companyName, setCompanyName] = useState(profile.company_name ?? "")
  const [brandingEnabled, setBrandingEnabled] = useState(profile.branding_enabled ?? false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = useMemo(() => createClient(), [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const acceptedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Format non supporté", { description: "Utilisez un fichier PNG, JPG ou SVG." })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Fichier trop volumineux", { description: "Le logo ne doit pas dépasser 2MB." })
      return
    }

    setUploading(true)

    try {
      if (logoUrl) {
        const oldPath = logoUrl.split("/logos/")[1]
        if (oldPath) await supabase.storage.from("logos").remove([oldPath])
      }

      const ext = file.name.split(".").pop()
      const path = `${profile.id}/logo.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("logos").getPublicUrl(path)

      setLogoUrl(data.publicUrl)
      setBrandingEnabled(true)

      await supabase
        .from("profiles")
        .update({ logo_url: data.publicUrl, branding_enabled: true })
        .eq("id", profile.id)

      toast.success("Logo uploadé ✅")
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'upload")
    }

    setUploading(false)
  }

  const handleRemoveLogo = async () => {
    if (!logoUrl) return

    try {
      const path = logoUrl.split("/logos/")[1]
      if (path) await supabase.storage.from("logos").remove([path])

      await supabase.from("profiles").update({ logo_url: null }).eq("id", profile.id)

      setLogoUrl(null)
      toast.success("Logo supprimé")
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from("profiles")
      .update({ company_name: companyName || null, branding_enabled: brandingEnabled })
      .eq("id", profile.id)

    if (error) {
      toast.error("Erreur lors de la sauvegarde")
    } else {
      toast.success("Informations sauvegardées ✅")
    }

    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Branding personnalisé
              </CardTitle>
              <CardDescription>
                {brandingEnabled
                  ? "Votre logo s'affiche sur les pages client et emails"
                  : "Le logo Chalto s'affiche sur les pages client et emails"}
              </CardDescription>
            </div>
            <Switch checked={brandingEnabled} onCheckedChange={setBrandingEnabled} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-40 border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/30 overflow-hidden">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={160}
                  height={80}
                  className="object-contain max-h-16"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Building2 className="h-6 w-6" />
                  <span className="text-xs">Aucun logo</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Upload..." : logoUrl ? "Changer" : "Uploader"}
                </Button>
                {logoUrl && (
                  <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
                    <X className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou SVG · 2MB max · 400x200px recommandé
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Informations entreprise
          </CardTitle>
          <CardDescription>Affiché sur vos pages client et documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nom de l&apos;entreprise</Label>
            <Input
              id="company_name"
              placeholder="Cabinet Dupont Architecture"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Aperçu — Page client</CardTitle>
          <CardDescription>Voici comment votre client verra la page de validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl p-6 bg-background space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={120}
                  height={48}
                  className="object-contain max-h-10"
                />
              ) : (
                <div className="h-10 w-28 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Votre logo</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">Propulsé par Chalto</span>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-primary/20 rounded flex-1" />
              <div className="h-8 bg-muted rounded flex-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} loading={saving} className="w-full">
        {saving ? "Sauvegarde..." : "Sauvegarder"}
      </Button>
    </div>
  )
}
