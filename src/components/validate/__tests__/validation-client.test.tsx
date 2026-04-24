// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import { ValidationClient } from "../validation-client"

// Stubs des dépendances externes
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ order: () => ({ then: (cb: (r: unknown) => void) => cb({ data: [] }) }) }),
      }),
    }),
  }),
}))
vi.mock("@/lib/haptics", () => ({ haptics: { success: vi.fn(), error: vi.fn() } }))
vi.mock("@/lib/analytics", () => ({
  analytics: { documentApproved: vi.fn(), documentRejected: vi.fn() },
}))
vi.mock("@/components/projects/file-viewer", () => ({
  FileViewer: () => <div data-testid="file-viewer" />,
}))
vi.mock("@/components/projects/project-stepper", () => ({
  ProjectStepper: () => <div data-testid="project-stepper" />,
}))

const mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
vi.stubGlobal("fetch", mockFetch)

const pendingDoc = {
  id: "doc-1",
  project_id: "proj-1",
  name: "Devis phase 1",
  type: "Devis",
  status: "sent",
  projects: { name: "Rénovation", phase: "cadrage" },
}

const approvedDoc = { ...pendingDoc, status: "approved" }
const rejectedDoc = { ...pendingDoc, status: "rejected" }

afterEach(() => cleanup())

beforeEach(() => {
  mockFetch.mockClear()
  mockFetch.mockResolvedValue(new Response(null, { status: 200 }))
})

describe("ValidationClient", () => {
  it("affiche les boutons Approuver et Refuser pour un document en attente", () => {
    render(<ValidationClient document={pendingDoc} token="tok-123" />)
    expect(screen.getByText("Approuver")).toBeTruthy()
    expect(screen.getByText("Refuser")).toBeTruthy()
  })

  it("affiche l'état 'approuvé' si le document est déjà approuvé", () => {
    render(<ValidationClient document={approvedDoc} token="tok-123" />)
    expect(screen.getByText("Document approuvé")).toBeTruthy()
    expect(screen.queryByText("Approuver")).toBeNull()
  })

  it("affiche l'état 'refusé' si le document est déjà refusé", () => {
    render(<ValidationClient document={rejectedDoc} token="tok-123" />)
    expect(screen.getByText("Document refusé")).toBeTruthy()
  })

  it("affiche le message du professionnel quand présent", () => {
    const doc = { ...pendingDoc, pro_message: "Merci de vérifier la page 3" }
    render(<ValidationClient document={doc} token="tok-123" />)
    expect(screen.getByText(/Merci de vérifier la page 3/)).toBeTruthy()
  })

  it("appelle fetch avec status=approved en cliquant Approuver", async () => {
    render(<ValidationClient document={pendingDoc} token="tok-abc" />)
    fireEvent.click(screen.getAllByText("Approuver")[0])
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string)
      expect(body.status).toBe("approved")
      expect(body.token).toBe("tok-abc")
    })
  })

  it("appelle fetch avec status=rejected en cliquant Refuser", async () => {
    render(<ValidationClient document={pendingDoc} token="tok-abc" />)
    fireEvent.click(screen.getAllByText("Refuser")[0])
    await waitFor(() => {
      const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string)
      expect(body.status).toBe("rejected")
    })
  })

  it("affiche l'écran de confirmation après approbation", async () => {
    render(<ValidationClient document={pendingDoc} token="tok-abc" />)
    fireEvent.click(screen.getAllByText("Approuver")[0])
    await waitFor(() => {
      expect(screen.getByText("Document approuvé")).toBeTruthy()
    })
  })

  it("transmet le commentaire saisi dans la requête", async () => {
    render(<ValidationClient document={pendingDoc} token="tok-abc" />)
    const textarea = screen.getByPlaceholderText(/Tout me semble correct/)
    fireEvent.change(textarea, { target: { value: "RAS, parfait" } })
    fireEvent.click(screen.getAllByText("Approuver")[0])
    await waitFor(() => {
      const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string)
      expect(body.comment).toBe("RAS, parfait")
    })
  })
})
