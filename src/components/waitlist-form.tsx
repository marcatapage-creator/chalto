"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const professions = [
  "Architecte",
  "Plombier",
  "Électricien",
  "Menuisier",
  "Entrepreneur GC",
  "Autre",
]

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [profession, setProfession] = useState("")
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
      body: JSON.stringify({ email, name, profession }),
    })

    if (res.status === 409) {
      setError("Cet email est déjà sur la liste — on vous contactera bientôt !")
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

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="bg-primary/10 rounded-full p-4">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold">Vous êtes sur la liste !</h3>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          On vous contactera en priorité dès l&apos;ouverture de la bêta. Merci pour votre intérêt
          pour Chalto !
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Input
          placeholder="Votre prénom (optionnel)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Votre email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex flex-wrap gap-2 justify-center">
          {professions.map((p) => (
            <button
              key={p}
              onClick={() => setProfession(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm border transition-all duration-150",
                profession === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50 hover:bg-muted"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button className="w-full" onClick={handleSubmit} disabled={loading || !email}>
        {loading ? "Inscription..." : "Rejoindre la liste d'attente →"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Gratuit · Sans engagement · On ne spam pas
      </p>
    </div>
  )
}
