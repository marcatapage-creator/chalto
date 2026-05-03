"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { toast } from "sonner"
import { useRealtimeChannel } from "@/hooks/use-realtime-channel"

export interface ProjectDocument {
  id: string
  name: string
  type: string
  status: string
  version: number
  validation_token: string
  project_id: string
  file_url?: string
  file_name?: string
  file_type?: string
  file_size?: number
  created_at: string
}

interface UseProjectDocumentsOptions {
  supabase: SupabaseClient
  projectId: string
  initialDocs: ProjectDocument[]
  initialUnreadDocs: number
  onNewDoc?: (doc: ProjectDocument) => void
}

interface UseProjectDocumentsReturn {
  docs: ProjectDocument[]
  unreadDocs: number
  markDocsRead: () => void
  handleDocStatusChange: (docId: string, status: string, version?: number) => void
  handleDeleteDoc: (docId: string) => void
}

export function useProjectDocuments({
  supabase,
  projectId,
  initialDocs,
  initialUnreadDocs,
  onNewDoc,
}: UseProjectDocumentsOptions): UseProjectDocumentsReturn {
  const [docs, setDocs] = useState(initialDocs)
  const [unreadDocs, setUnreadDocs] = useState(initialUnreadDocs)

  // Keep onNewDoc in a ref so the Realtime callback always sees the latest version
  // without needing to recreate the channel subscription
  const onNewDocRef = useRef(onNewDoc)
  useEffect(() => {
    onNewDocRef.current = onNewDoc
  })

  // Sync when server re-fetches
  useEffect(() => {
    setDocs(initialDocs)
  }, [initialDocs])

  // Refresh Realtime auth token once on mount
  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) supabase.realtime.setAuth(session.access_token)
    })
  }, [supabase])

  const setup = useCallback(
    (channel: ReturnType<SupabaseClient["channel"]>) =>
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "documents",
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            const newDoc = payload.new as ProjectDocument
            setDocs((prev) => (prev.some((d) => d.id === newDoc.id) ? prev : [newDoc, ...prev]))
            onNewDocRef.current?.(newDoc)
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "documents",
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            const updated = payload.new as ProjectDocument
            setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "validations" },
          (payload) => {
            const v = payload.new as { document_id: string; status: string }
            setDocs((prev) =>
              prev.map((d) => (d.id === v.document_id ? { ...d, status: v.status } : d))
            )
            setUnreadDocs((n) => n + 1)
          }
        )
        .on("broadcast", { event: "document_status_updated" }, ({ payload }) => {
          const { documentId, status } = payload as { documentId: string; status: string }
          setDocs((prev) => prev.map((d) => (d.id === documentId ? { ...d, status } : d)))
        }),
    [projectId]
  )

  useRealtimeChannel(supabase, `documents:${projectId}`, setup)

  const markDocsRead = useCallback(() => setUnreadDocs(0), [])

  const handleDocStatusChange = useCallback((docId: string, status: string, version?: number) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, status, ...(version !== undefined && { version }) } : d
      )
    )
  }, [])

  const handleDeleteDoc = useCallback(
    (docId: string) => {
      const doc = docs.find((d) => d.id === docId)
      if (!doc) return

      setDocs((prev) => prev.filter((d) => d.id !== docId))

      let cancelled = false
      toast.success("Document supprimé", {
        action: {
          label: "Annuler",
          onClick: () => {
            cancelled = true
            setDocs((prev) => {
              if (prev.some((d) => d.id === docId)) return prev
              return [...prev, doc].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
            })
          },
        },
        duration: 5000,
      })

      setTimeout(async () => {
        if (cancelled) return
        if (doc.file_url) {
          const path = doc.file_url.split("/storage/v1/object/public/documents/").at(1)
          if (path) await supabase.storage.from("documents").remove([path])
        }
        const { error } = await supabase.from("documents").delete().eq("id", docId)
        if (error) {
          setDocs((prev) => {
            if (prev.some((d) => d.id === docId)) return prev
            return [...prev, doc]
          })
          toast.error("Erreur lors de la suppression")
        }
      }, 5000)
    },

    [docs, supabase]
  )

  return { docs, unreadDocs, markDocsRead, handleDocStatusChange, handleDeleteDoc }
}
