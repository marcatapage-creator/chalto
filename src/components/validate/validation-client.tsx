"use client"

import { useState, useEffect, useMemo } from "react"
import { haptics } from "@/lib/haptics"
import { analytics } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, FileText, Building2 } from "lucide-react"
import { FileViewer } from "@/components/projects/file-viewer"
import { ProjectStepper } from "@/components/projects/project-stepper"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { fetchWithTimeout } from "@/lib/fetch-timeout"

type Document = {
  id: string
  project_id: string
  name: string
  type: string
  status: string
  version?: number
  file_url?: string
  file_name?: string
  file_type?: string
  pro_message?: string | null
  projects?: { name: string; client_name?: string | null; phase?: string | null } | null
}

interface DocumentVersion {
  id: string
  version: number
  file_url: string | null
  file_name: string | null
  file_type: string | null
  created_at: string
}

export function ValidationClient({
  document,
  token,
  requestType = "validation",
}: {
  document: Document
  token: string
  requestType?: "validation" | "transmission"
}) {
  const isTransmission = requestType === "transmission"
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "commented">("pending")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(
    document.status === "approved" ||
      document.status === "rejected" ||
      document.status === "commented"
  )
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [activeVersion, setActiveVersion] = useState<number | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", document.id)
      .order("version", { ascending: true })
      .limit(20)
      .then(({ data }) => {
        if (data) setVersions(data)
      })
  }, [document.id, supabase])

  const activeVersionData =
    activeVersion !== null ? (versions.find((v) => v.version === activeVersion) ?? null) : null

  const currentFileUrl = activeVersionData?.file_url ?? document.file_url
  const currentFileName = activeVersionData?.file_name ?? document.file_name
  const currentFileType = activeVersionData?.file_type ?? document.file_type
  const isLatestVersion = activeVersion === null

  const handleValidation = async (decision: "approved" | "rejected" | "commented") => {
    setLoading(true)
    await fetchWithTimeout("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, status: decision, comment: comment || null }),
    })
    if (decision === "rejected") {
      haptics.error()
      analytics.documentRejected()
    } else {
      haptics.success()
      if (decision === "approved") analytics.documentApproved()
    }
    setStatus(decision)
    setDone(true)
    setLoading(false)
  }

  if (done || status !== "pending") {
    const isCommented = status === "commented" || document.status === "commented"
    const isApproved = status === "approved" || document.status === "approved"
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          {isCommented ? (
            <>
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-xl font-bold">Réception confirmée</h2>
              <p className="text-muted-foreground mt-2">
                Votre professionnel a été notifié de la bonne réception.
              </p>
            </>
          ) : isApproved ? (
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
              {isTransmission
                ? "Document transmis pour information"
                : "Document soumis à votre validation"}
            </span>
            <Badge variant="outline">{isTransmission ? "Pour information" : "En attente"}</Badge>
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
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Document
          </p>

          {/* Onglets versions */}
          {versions.length > 0 && (
            <div className="flex text-xs border rounded-lg overflow-hidden">
              {versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVersion(v.version)}
                  className={cn(
                    "flex-1 px-3 py-1.5 transition-colors border-r",
                    activeVersion === v.version
                      ? "bg-background font-medium"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  V{v.version}
                </button>
              ))}
              <button
                onClick={() => setActiveVersion(null)}
                className={cn(
                  "flex-1 px-3 py-1.5 transition-colors",
                  isLatestVersion
                    ? "bg-background font-medium"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                V{document.version ?? 1} · Actuelle
              </button>
            </div>
          )}

          {currentFileUrl ? (
            <FileViewer
              fileUrl={currentFileUrl}
              fileName={currentFileName ?? document.name}
              fileType={currentFileType ?? "application/pdf"}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucun fichier pour cette version
            </p>
          )}

          {!isLatestVersion && (
            <p className="text-xs text-muted-foreground text-center">
              Version archivée —{" "}
              <button
                onClick={() => setActiveVersion(null)}
                className="text-primary hover:underline"
              >
                revenir à la version actuelle
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Commentaire + boutons — uniquement sur la version actuelle */}
      {isLatestVersion && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Votre commentaire (optionnel)</CardTitle>
              <CardDescription>
                {isTransmission
                  ? "Laissez un message à votre professionnel si vous le souhaitez"
                  : "Laissez un message au professionnel avant de valider ou refuser"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={
                  isTransmission
                    ? "J'ai bien pris connaissance du document..."
                    : "Tout me semble correct... / Je souhaite modifier..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {isTransmission ? (
            <>
              <Button
                size="lg"
                className="w-full"
                onClick={() => handleValidation("commented")}
                loading={loading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                J&apos;ai bien reçu ce document
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Votre professionnel sera notifié de la bonne réception.
              </p>
            </>
          ) : (
            <>
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
                En approuvant ce document, vous confirmez en avoir pris connaissance et validez son
                contenu.
              </p>
            </>
          )}
        </>
      )}
    </div>
  )
}
