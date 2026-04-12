"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, FileText, Building2 } from "lucide-react"

type Document = {
  id: string
  name: string
  type: string
  status: string
  validation_token: string
  projects?: { name: string; client_name?: string | null } | null
}

export function ValidationClient({ document }: { document: Document }) {
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(document.status === "approved" || document.status === "rejected")
  const supabase = createClient()

  const handleValidation = async (decision: "approved" | "rejected") => {
    setLoading(true)

    // Créer la validation
    await supabase.from("validations").insert({
      document_id: document.id,
      status: decision,
      comment: comment || null,
      approved_at: decision === "approved" ? new Date().toISOString() : null,
    })

    // Mettre à jour le statut du document
    await supabase.from("documents").update({ status: decision }).eq("id", document.id)

    setStatus(decision)
    setDone(true)
    setLoading(false)
  }

  if (done || status !== "pending") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          {status === "approved" || document.status === "approved" ? (
            <>
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-xl font-bold">Document approuvé</h2>
              <p className="text-muted-foreground mt-2">
                Votre approbation a bien été enregistrée.
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-bold">Document refusé</h2>
              <p className="text-muted-foreground mt-2">
                Votre retour a bien été transmis au professionnel.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Infos document */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-muted p-2 rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>{document.name}</CardTitle>
              <CardDescription>
                {document.projects?.name} · {document.type}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Document soumis à votre validation
            </span>
            <Badge variant="outline">En attente</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Commentaire */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Votre commentaire (optionnel)</CardTitle>
          <CardDescription>
            Laissez un message au professionnel avant de valider ou refuser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tout me semble correct... / Je souhaite modifier..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => handleValidation("rejected")}
          disabled={loading}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Refuser
        </Button>
        <Button size="lg" onClick={() => handleValidation("approved")} disabled={loading}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Approuver
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        En approuvant ce document, vous confirmez en avoir pris connaissance et validez son contenu.
      </p>
    </div>
  )
}
