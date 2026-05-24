"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/projects/file-upload"
import { FileViewer } from "@/components/projects/file-viewer"
import { createClient } from "@/lib/supabase/client"
import { FileText, X } from "lucide-react"
import { cn, isChantierPhase } from "@/lib/utils"
import { toast } from "sonner"
import { docStatusMap } from "@/lib/doc-status"
import { useRealtimeChannel } from "@/hooks/use-realtime-channel"
import { ValidationResultBanner } from "./document-validation-banner"
import { ValidationsSection } from "./document-validations-section"
import { DocumentVersionTabs } from "./document-version-tabs"
import { DocumentPanelFooter } from "./document-panel-footer"
import { useMediaQuery } from "@/hooks/use-media-query"
import type {
  ValidationData,
  ValidationEntry,
  ContributorValidator,
  PrevVersion,
  AudienceInfo,
} from "./document-panel-types"

import type { ProjectDocument } from "@/types/domain"

export interface DocumentPanelProps {
  document: ProjectDocument
  userId: string
  clientName?: string
  phase?: string
  onClose: () => void
  showClose?: boolean
  onStatusChange?: (docId: string, status: string, version?: number) => void
  initialValidation?: ValidationData | null
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DocumentPanel({
  document,
  userId,
  clientName,
  phase,
  onClose,
  showClose,
  onStatusChange,
  initialValidation,
}: DocumentPanelProps) {
  const isChantier = isChantierPhase(phase)
  const isMobile = useMediaQuery("(max-width: 1279px)")
  const router = useRouter()
  const [localStatus, setLocalStatus] = useState(document.status)
  const [localVersion, setLocalVersion] = useState(document.version ?? 1)
  // undefined = unset (fall through to document.*); null = explicitly cleared; string = uploaded value
  const [localFileUrl, setLocalFileUrl] = useState<string | null | undefined>(undefined)
  const [localFileName, setLocalFileName] = useState<string | null | undefined>(undefined)
  const [localFileType, setLocalFileType] = useState<string | null | undefined>(undefined)
  const [prevVersions, setPrevVersions] = useState<PrevVersion[]>([])
  const [activeVersionTab, setActiveVersionTab] = useState<number | null>(() => {
    if (typeof window === "undefined") return null
    const saved = localStorage.getItem(`doc_version_${document.id}`)
    return saved !== null ? Number(saved) : null
  })
  const onStatusChangeRef = useRef(onStatusChange)
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  const [validationEntry, setValidationEntry] = useState<{
    docId: string
    data: ValidationData | null
  }>({ docId: document.id, data: initialValidation ?? null })
  const [audienceInfo, setAudienceInfo] = useState<AudienceInfo>({
    requestType: null,
    names: [],
    inviteTokens: [],
  })
  const [allValidations, setAllValidations] = useState<ValidationEntry[]>([])
  const [validatorContributors, setValidatorContributors] = useState<ContributorValidator[]>([])
  const [proposing, setProposing] = useState(false)

  const handleVersionTabChange = useCallback(
    (version: number | null) => {
      setActiveVersionTab(version)
      if (version === null) {
        localStorage.removeItem(`doc_version_${document.id}`)
      } else {
        localStorage.setItem(`doc_version_${document.id}`, String(version))
      }
    },
    [document.id]
  )

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase
      .from("document_versions")
      .select("version, file_url, file_name")
      .eq("document_id", document.id)
      .order("version", { ascending: false })
      .then(({ data }) => {
        if (data) {
          const typed = data as unknown as PrevVersion[]
          setPrevVersions(
            typed.filter((v, i, arr) => arr.findIndex((x) => x.version === v.version) === i)
          )
        }
      })
  }, [document.id, supabase])

  const validation = validationEntry.docId === document.id ? validationEntry.data : null
  const docStatus = docStatusMap[localStatus] ?? docStatusMap.draft
  const fileUrl = localFileUrl === undefined ? document.file_url : localFileUrl

  const fetchAllValidations = useCallback(async () => {
    const { data, error } = await supabase
      .from("validations")
      .select("status, comment, approved_at, client_name, contributor_id, version")
      .eq("document_id", document.id)
      .order("created_at", { ascending: true })
      .limit(50)
    if (error) {
      console.error("[document-panel] fetchAllValidations error:", error)
      toast.error("Impossible de charger les validations")
      return
    }
    if (data) setAllValidations(data as unknown as ValidationEntry[])
  }, [document.id, supabase])

  const fetchValidation = useCallback(async () => {
    const { data, error } = await supabase
      .from("validations")
      .select("status, comment, approved_at, client_name, contributor_id, version")
      .eq("document_id", document.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) {
      console.error("[document-panel] fetchValidation error:", error)
      toast.error("Impossible de charger le statut du document")
      return
    }
    if (data) {
      setValidationEntry({ docId: document.id, data: data as unknown as ValidationData })
      if (data.status) {
        setLocalStatus(data.status)
        onStatusChangeRef.current?.(document.id, data.status)
      }
    }
  }, [document.id, supabase])

  useEffect(() => {
    supabase
      .from("validations")
      .select("status, comment, approved_at, client_name, contributor_id, version")
      .eq("document_id", document.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("[document-panel] validation fetch error:", error)
          return
        }
        setValidationEntry({
          docId: document.id,
          data: (data ?? null) as unknown as ValidationData | null,
        })
        // Skip stale validations: a "draft" doc has none; a "sent" doc only has a current
        // validation if the version matches (guards against old validations from previous send cycles).
        const docVersion = document.version ?? 1
        const valVersion = (data as { version?: number | null } | null)?.version ?? 1
        const isCurrentVersion = valVersion === docVersion
        const isLegacy =
          document.status === "draft" || (document.status === "sent" && !isCurrentVersion)
        if (data?.status && !isLegacy) {
          setLocalStatus(data.status)
          onStatusChangeRef.current?.(document.id, data.status)
        }
      })
    supabase
      .from("validations")
      .select("status, comment, approved_at, client_name, contributor_id, version")
      .eq("document_id", document.id)
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setAllValidations(data as unknown as ValidationEntry[])
      })
  }, [document.id, document.status, supabase])

  useEffect(() => {
    supabase
      .from("document_contributors")
      .select("contributor_id")
      .eq("document_id", document.id)
      .eq("request_type", "validation")
      .limit(20)
      .then(async ({ data: dcs }) => {
        if (!dcs?.length) return
        const ids = dcs.map((d) => d.contributor_id)
        const { data: contribs } = await supabase
          .from("contributors")
          .select("id, name")
          .in("id", ids)
        setValidatorContributors(contribs ?? [])
      })
  }, [document.id, supabase])

  useEffect(() => {
    if (localStatus !== "sent") return

    const refresh = async () => {
      const { data: dcData } = await supabase
        .from("document_contributors")
        .select("request_type, contributor_id")
        .eq("document_id", document.id)

      if (!dcData?.length) return

      const reqType = (dcData[0].request_type as "validation" | "transmission") ?? "validation"
      const ids = dcData.map((d) => d.contributor_id)
      const { data: contribs } = await supabase
        .from("contributors")
        .select("name, invite_token")
        .in("id", ids)

      setAudienceInfo({
        requestType: reqType,
        names: contribs?.map((c) => c.name) ?? [],
        inviteTokens: contribs?.map((c) => c.invite_token).filter((t): t is string => !!t) ?? [],
      })

      // Met à jour la liste des prestataires en attente de validation
      const validationIds = dcData
        .filter((d) => d.request_type === "validation")
        .map((d) => d.contributor_id)
      if (validationIds.length > 0) {
        const { data: validators } = await supabase
          .from("contributors")
          .select("id, name")
          .in("id", validationIds)
        setValidatorContributors(validators ?? [])
      }
    }

    // Double déclenchement : immédiat (panel déjà "sent") + 500ms (après upsert optimiste)
    void refresh()
    const timer = setTimeout(() => void refresh(), 500)
    return () => clearTimeout(timer)
  }, [document.id, localStatus, supabase])

  useRealtimeChannel(supabase, `document-panel:${document.id}`, (channel) =>
    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
          filter: `id=eq.${document.id}`,
        },
        (payload) => {
          const updated = payload.new as { status: string }
          setLocalStatus(updated.status)
          onStatusChangeRef.current?.(document.id, updated.status)
          if (updated.status !== "draft" && updated.status !== "sent") {
            // Délai pour laisser l'INSERT validations se committer avant de le lire
            setTimeout(() => void fetchValidation(), 400)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "validations",
          filter: `document_id=eq.${document.id}`,
        },
        () => {
          void fetchValidation()
          void fetchAllValidations()
        }
      )
      .on("broadcast", { event: "document_status_updated" }, ({ payload }) => {
        const p = payload as {
          documentId: string
          status: string
          comment?: string | null
          contributorName?: string
        }
        if (p.documentId !== document.id || p.status !== "commented") return
        setLocalStatus("commented")
        setValidationEntry({
          docId: document.id,
          data: {
            status: "commented",
            comment: p.comment ?? undefined,
            client_name: p.contributorName ?? "Le prestataire",
            approved_at: new Date().toISOString(),
          },
        })
        onStatusChangeRef.current?.(document.id, "commented")
      })
  )

  const handleRemoveFile = async () => {
    const { error } = await supabase
      .from("documents")
      .update({ file_url: null, file_name: null, file_type: null, file_size: null })
      .eq("id", document.id)
    if (error) {
      console.error("[document-panel] handleRemoveFile error:", error)
      toast.error("Erreur lors de la suppression du fichier")
      return
    }
    setLocalFileUrl(null)
    setLocalFileName(null)
    setLocalFileType(null)
    toast.success("Fichier supprimé")
  }

  const handleProposeV2 = async () => {
    setProposing(true)
    const newVersion = localVersion + 1
    const newToken = crypto.randomUUID()

    const [, { error }] = await Promise.all([
      supabase.from("document_versions").insert({
        document_id: document.id,
        version: localVersion,
        file_url: fileUrl ?? null,
        file_name: document.file_name ?? null,
        file_type: document.file_type ?? null,
        file_size: document.file_size ?? null,
      }),
      supabase
        .from("documents")
        .update({
          status: "draft",
          version: newVersion,
          file_url: null,
          file_name: null,
          file_type: null,
          file_size: null,
          validation_token: newToken,
        })
        .eq("id", document.id),
    ])

    if (error) {
      console.error("[proposeV2]", error)
      toast.error("Erreur lors de la création de la nouvelle version")
      setProposing(false)
      return
    }

    setPrevVersions((prev) =>
      [
        {
          version: localVersion,
          file_url: fileUrl ?? null,
          file_name: document.file_name,
          file_type: document.file_type,
        },
        ...prev.filter((p) => p.version !== localVersion),
      ].slice(0, 3)
    )
    setLocalVersion(newVersion)
    setLocalStatus("draft")
    setLocalFileUrl(null)
    setLocalFileName(null)
    setLocalFileType(null)
    handleVersionTabChange(null)
    onStatusChange?.(document.id, "draft", newVersion)

    setProposing(false)
    toast.success(`Version ${newVersion} créée — uploadez le nouveau fichier`)
  }

  const handleCopyLink = () => {
    const isContributor = document.audience === "contributor"
    const url =
      isContributor && audienceInfo.inviteTokens[0]
        ? `${window.location.origin}/invite/${audienceInfo.inviteTokens[0]}`
        : `${window.location.origin}/validate/${document.validation_token}`
    navigator.clipboard.writeText(url)
    toast.success(
      isContributor && audienceInfo.inviteTokens.length > 1
        ? `Lien du 1er prestataire copié (${audienceInfo.inviteTokens.length} au total)`
        : "Lien copié dans le presse-papiers"
    )
  }

  const activePrev =
    activeVersionTab !== null
      ? (prevVersions.find((p) => p.version === activeVersionTab) ?? null)
      : null

  const isViewingArchive = activeVersionTab !== null
  const activeVersion = activeVersionTab ?? localVersion

  // Dernière validation pour la version affichée (banner + status)
  const bannerValidation = useMemo(() => {
    if (allValidations.length > 0) {
      const forVersion = allValidations.filter((v) => (v.version ?? 1) === activeVersion)
      return forVersion.length > 0 ? forVersion[forVersion.length - 1] : null
    }
    // Avant que allValidations charge, on repart sur validationEntry (version courante seulement)
    return !isViewingArchive ? validation : null
  }, [allValidations, activeVersion, isViewingArchive, validation])

  // Pour une version archivée on affiche toujours le résultat (pas de "sent"/"draft")
  const bannerStatus = isViewingArchive ? (bannerValidation?.status ?? "draft") : localStatus

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 xl:py-0 border-b flex items-center justify-between gap-3 shrink-0 xl:min-h-25.25">
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-muted p-1.5 rounded-md shrink-0">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{document.name}</p>
            <p className="text-xs text-muted-foreground">{document.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={docStatus.variant} className={cn("text-xs", docStatus.className)}>
            {localVersion > 1
              ? `V${localVersion} ${docStatus.label.toLowerCase()}`
              : docStatus.label}
          </Badge>
          {showClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <ValidationResultBanner
        validation={bannerValidation as ValidationData | null}
        localStatus={bannerStatus}
      />

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 py-4 space-y-3">
          <ValidationsSection
            allValidations={allValidations}
            validatorContributors={validatorContributors}
            clientName={clientName}
            activeVersion={activeVersionTab ?? localVersion}
            isCurrentVersion={activeVersionTab === null}
          />

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Fichier
          </p>

          <DocumentVersionTabs
            prevVersions={prevVersions}
            localVersion={localVersion}
            activeVersionTab={activeVersionTab}
            onVersionChange={handleVersionTabChange}
          />

          {activePrev ? (
            activePrev.file_url ? (
              <FileViewer
                fileUrl={activePrev.file_url}
                fileName={activePrev.file_name ?? document.name}
                fileType={activePrev.file_type ?? "application/pdf"}
              />
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground border rounded-lg border-dashed">
                Aucun fichier pour la V{activeVersionTab}
              </div>
            )
          ) : fileUrl ? (
            <FileViewer
              fileUrl={fileUrl}
              fileName={localFileName ?? document.file_name ?? document.name}
              fileType={localFileType ?? document.file_type ?? "application/pdf"}
              onRemove={localStatus === "draft" ? handleRemoveFile : undefined}
            />
          ) : (
            <FileUpload
              documentId={document.id}
              userId={userId}
              onSuccess={(url, fileName, fileType) => {
                setLocalFileUrl(url)
                setLocalFileName(fileName)
                setLocalFileType(fileType)
              }}
            />
          )}
        </div>
      </div>

      <DocumentPanelFooter
        localStatus={localStatus}
        isChantier={isChantier}
        fileUrl={fileUrl}
        proposing={proposing}
        documentId={document.id}
        documentName={document.name}
        projectId={document.project_id}
        clientName={clientName}
        localVersion={localVersion}
        audienceInfo={audienceInfo}
        cloudFileId={document.cloud_file_id}
        onProposeV2={handleProposeV2}
        onCopyLink={handleCopyLink}
        onStatusChange={(newStatus) => {
          setLocalStatus(newStatus)
          onStatusChangeRef.current?.(document.id, newStatus)
        }}
        onOpenSend={
          isMobile
            ? () => router.push(`/projects/${document.project_id}/document/${document.id}/send`)
            : undefined
        }
        onResynced={(version, newFileUrl) => {
          setLocalVersion(version)
          setLocalStatus("draft")
          setLocalFileUrl(newFileUrl)
          handleVersionTabChange(null)
          onStatusChange?.(document.id, "draft", version)
        }}
      />
    </div>
  )
}
