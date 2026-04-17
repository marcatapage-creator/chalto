"use client"

import { useState } from "react"
import { haptics } from "@/lib/haptics"
import { analytics } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, FileText, Building2 } from "lucide-react"
import { FileViewer } from "@/components/projects/file-viewer"
import { ProjectStepper } from "@/components/projects/project-stepper"

type Document = {
  id: string
  project_id: string
  name: string
  type: string
  status: string
  file_url?: string
  file_name?: string
  file_type?: string
  pro_message?: string | null
  projects?: { name: string; client_name?: string | null; phase?: string | null } | null
}

export function ValidationClient({ document, token }: { document: Document; token: string }) {
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(document.status === "approved" || document.status === "rejected")

  const handleValidation = async (decision: "approved" | "rejected") => {
    setLoading(true)

    await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, status: decision, comment: comment || null }),
    })

    if (decision === "approved") {
      haptics.success()
      analytics.documentApproved()
    } else {
      haptics.error()
      analytics.documentRejected()
    }
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
      {/* Stepper */}
      <ProjectStepper
        projectId={document.project_id}
        currentPhase={document.projects?.phase ?? "cadrage"}
        readOnly
      />

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

      {/* Message du professionnel */}
      {document.pro_message && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Message de votre professionnel
            </p>
            <p className="text-sm text-foreground leading-relaxed italic">
              {`"${document.pro_message}"`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Visionneuse */}
      {document.file_url && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Document
            </p>
            <FileViewer
              fileUrl={document.file_url}
              fileName={document.file_name ?? document.name}
              fileType={document.file_type ?? "application/pdf"}
            />
          </CardContent>
        </Card>
      )}

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
          loading={loading}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Refuser
        </Button>
        <Button size="lg" onClick={() => handleValidation("approved")} loading={loading}>
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
