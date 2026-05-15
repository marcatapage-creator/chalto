"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, CheckCircle, Lock, ArrowRight } from "lucide-react"

const BETA_COUNT = 2
const BETA_TOTAL = 10

const gains = [
  {
    title: "Accès complet et gratuit",
    desc: "Toutes les fonctionnalités. Sans CB. Sans engagement.",
  },
  {
    title: "Onboarding personnalisé",
    desc: "Marc configure votre premier projet avec vous. En 20 minutes.",
  },
  {
    title: "Influence directe sur le produit",
    desc: "Vos retours façonnent les prochaines fonctionnalités.",
  },
  {
    title: "Tarif bêta à vie",
    desc: "Les bêta testeurs accèdent à Chalto au tarif fondateur pour toujours.",
  },
]

const asks = [
  "Tester sur un vrai projet actif",
  "20 min de retour terrain par mois",
  "Honnêteté totale — le bon comme le moins bon",
]

export function LandingBetaSection() {
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [specialite, setSpecialite] = useState("")
  const [, setProjets] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email) {
      setError("Votre email est obligatoire")
      return
    }
    setLoading(true)
    setError(null)

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: prenom, profession: specialite }),
    })

    if (res.status === 409) {
      setError("Cet email est déjà inscrit — on vous contactera bientôt !")
      setLoading(false)
      return
    }
    if (!res.ok) {
      setError("Une erreur est survenue. Réessayez.")
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  const progressPct = Math.round((BETA_COUNT / BETA_TOTAL) * 100)

  return (
    <section id="waitlist" className="py-20 px-6 md:px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Rejoignez les premiers architectes sur Chalto
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            On cherche 10 architectes indépendants prêts à tester Chalto sur un vrai projet. Pas
            pour nous faire plaisir — pour construire quelque chose qui colle vraiment à votre
            réalité.
          </p>
        </div>

        {/* 2-col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left — proposition */}
          <div className="flex flex-col gap-8">
            {/* Ce que vous gagnez */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                Ce que vous gagnez
              </p>
              <div className="flex flex-col gap-5">
                {gains.map((g) => (
                  <div key={g.title} className="flex gap-3">
                    <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <Check
                        className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                        strokeWidth={3}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{g.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-border" />

            {/* Ce qu'on vous demande */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                Ce qu&apos;on vous demande
              </p>
              <div className="flex flex-col gap-3">
                {asks.map((a) => (
                  <div key={a} className="flex gap-3 items-start">
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — formulaire */}
          <div className="bg-background rounded-2xl border border-border p-8 flex flex-col gap-6 shadow-sm">
            <p className="text-lg font-bold text-foreground">Rejoindre la bêta</p>

            {success ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="bg-primary/10 rounded-full p-4">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <p className="text-base font-bold text-foreground text-center">
                  Vous êtes sur la liste !
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  On vous contacte en priorité dès l&apos;ouverture. Merci 🙏
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Prénom *
                    </label>
                    <Input
                      placeholder="ex. Sophie"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Email professionnel *
                    </label>
                    <Input
                      type="email"
                      placeholder="vous@agence.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Votre spécialité
                    </label>
                    <Select onValueChange={setSpecialite}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MOE">MOE</SelectItem>
                        <SelectItem value="Archi intérieur">Architecte d&apos;intérieur</SelectItem>
                        <SelectItem value="Contractant général">Contractant général</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Nombre de projets actifs
                    </label>
                    <Select onValueChange={setProjets}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3">1 – 3</SelectItem>
                        <SelectItem value="4-8">4 – 8</SelectItem>
                        <SelectItem value="9+">9+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={loading || !email || !prenom}
                >
                  {loading ? "Inscription…" : "Je rejoins la bêta →"}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>Vos données restent privées. Aucun spam. Jamais.</span>
                </div>
              </>
            )}

            {/* Progress bar */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">{BETA_COUNT} architectes</span>{" "}
                  inscrits sur {BETA_TOTAL} places disponibles
                </span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
