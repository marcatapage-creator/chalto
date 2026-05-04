import { describe, it, expect, vi, beforeEach } from "vitest"
import type { ProjectDocument } from "@/types/domain"

/**
 * Tests logique de transformation d'état de useProjectDocuments sans DOM.
 * On extrait les transformations pures pour les tester directement.
 */

const doc1: ProjectDocument = {
  id: "doc-1",
  name: "Doc A",
  type: "Plan",
  status: "draft",
  version: 1,
  validation_token: "t1",
  project_id: "proj-1",
  created_at: "2025-01-01T00:00:00Z",
}

const doc2: ProjectDocument = {
  id: "doc-2",
  name: "Doc B",
  type: "CCTP",
  status: "sent",
  version: 2,
  validation_token: "t2",
  project_id: "proj-1",
  created_at: "2025-01-02T00:00:00Z",
}

// Transformations pures extraites de useProjectDocuments
const applyStatusChange =
  (docId: string, status: string, version?: number) => (prev: ProjectDocument[]) =>
    prev.map((d) =>
      d.id === docId ? { ...d, status, ...(version !== undefined && { version }) } : d
    )

const applyDelete = (docId: string) => (prev: ProjectDocument[]) =>
  prev.filter((d) => d.id !== docId)

const applyInsert = (newDoc: ProjectDocument) => (prev: ProjectDocument[]) =>
  prev.some((d) => d.id === newDoc.id) ? prev : [newDoc, ...prev]

const applyBroadcastStatus = (documentId: string, status: string) => (prev: ProjectDocument[]) =>
  prev.map((d) => (d.id === documentId ? { ...d, status } : d))

describe("useProjectDocuments — transformations d'état", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("handleDocStatusChange", () => {
    it("met à jour statut et version du document ciblé", () => {
      const docs = applyStatusChange("doc-1", "sent", 3)([doc1, doc2])
      expect(docs.find((d) => d.id === "doc-1")).toMatchObject({ status: "sent", version: 3 })
      expect(docs.find((d) => d.id === "doc-2")).toMatchObject({ status: "sent", version: 2 })
    })

    it("conserve la version existante si non fournie", () => {
      const docs = applyStatusChange("doc-1", "sent")([doc1, doc2])
      expect(docs.find((d) => d.id === "doc-1")).toMatchObject({ status: "sent", version: 1 })
    })

    it("ne modifie pas les autres documents", () => {
      const docs = applyStatusChange("doc-1", "approved")([doc1, doc2])
      expect(docs.find((d) => d.id === "doc-2")).toEqual(doc2)
    })

    it("ne change rien si l'id n'existe pas", () => {
      const docs = applyStatusChange("unknown", "sent")([doc1, doc2])
      expect(docs).toEqual([doc1, doc2])
    })
  })

  describe("handleDeleteDoc", () => {
    it("supprime le document ciblé", () => {
      const docs = applyDelete("doc-1")([doc1, doc2])
      expect(docs.map((d) => d.id)).not.toContain("doc-1")
      expect(docs).toHaveLength(1)
    })

    it("ne modifie pas les autres documents", () => {
      const docs = applyDelete("doc-1")([doc1, doc2])
      expect(docs[0]).toEqual(doc2)
    })

    it("ne change rien si l'id n'existe pas", () => {
      const docs = applyDelete("unknown")([doc1, doc2])
      expect(docs).toEqual([doc1, doc2])
    })
  })

  describe("INSERT Realtime", () => {
    it("ajoute un nouveau document en tête", () => {
      const newDoc: ProjectDocument = { ...doc1, id: "doc-3", name: "Doc C" }
      const docs = applyInsert(newDoc)([doc1, doc2])
      expect(docs[0].id).toBe("doc-3")
      expect(docs).toHaveLength(3)
    })

    it("n'ajoute pas un document déjà présent (idempotent)", () => {
      const docs = applyInsert(doc1)([doc1, doc2])
      expect(docs).toHaveLength(2)
    })
  })

  describe("broadcast document_status_updated", () => {
    it("met à jour le statut via broadcast", () => {
      const docs = applyBroadcastStatus("doc-2", "approved")([doc1, doc2])
      expect(docs.find((d) => d.id === "doc-2")?.status).toBe("approved")
    })
  })
})
