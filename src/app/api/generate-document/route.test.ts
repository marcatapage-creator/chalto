import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as adminModule from "@/lib/supabase/admin"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/supabase/admin")
vi.mock("docx", () => ({
  Document: class {},
  Paragraph: class {},
  TextRun: class {},
  HeadingLevel: { TITLE: "TITLE", HEADING_1: "H1" },
  Packer: { toBuffer: vi.fn().mockResolvedValue(Buffer.from("fake-docx")) },
  AlignmentType: { CENTER: "center" },
}))

const VALID_BODY = {
  projectId: "proj-1",
  projectName: "Rénovation Dupont",
  workType: "Rénovation complète",
  documentType: "cctp",
  answers: {
    lots: ["Gros œuvre"],
    materiaux: "Béton",
    contraintes: "",
    niveau: "standard",
  },
}

function req(body: unknown) {
  return new Request("http://localhost/api/generate-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function tableChain(result: unknown): Record<string, unknown> {
  const chain = (): Record<string, unknown> => ({
    select: () => chain(),
    eq: () => chain(),
    update: () => chain(),
    insert: () => chain(),
    single: () => Promise.resolve(result),
    then: (f?: ((v: unknown) => unknown) | null, r?: ((e: unknown) => unknown) | null) =>
      Promise.resolve(result).then(f, r),
  })
  return chain()
}

function makeUserClient(
  projectResult: { data: unknown; error: unknown },
  docResult: { data: unknown; error: unknown },
  userId = "user-1"
) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } } }) },
    from: (table: string) => {
      if (table === "projects") return tableChain(projectResult)
      if (table === "documents") return tableChain(docResult)
      return tableChain({ data: null, error: null })
    },
  } as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
}

function makeAdmin(uploadError: unknown = null) {
  return {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: uploadError }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "https://cdn.example.com/cctp.docx" },
        }),
      }),
    },
    from: () => tableChain({ error: null }),
  } as unknown as ReturnType<typeof adminModule.createAdminClient>
}

const PROJECT = { id: "proj-1" }
const NEW_DOC = { id: "doc-new-1" }

beforeEach(() => {
  vi.clearAllMocks()
})

describe("POST /api/generate-document", () => {
  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof serverModule.createClient>>)

    const res = await POST(req(VALID_BODY))
    expect(res.status).toBe(401)
  })

  it("retourne 400 si les paramètres sont manquants", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeUserClient({ data: PROJECT, error: null }, { data: NEW_DOC, error: null })
    )
    const res = await POST(req({ projectId: "proj-1" }))
    expect(res.status).toBe(400)
  })

  it("retourne 400 si answers.lots est vide", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeUserClient({ data: PROJECT, error: null }, { data: NEW_DOC, error: null })
    )
    const res = await POST(req({ ...VALID_BODY, answers: { ...VALID_BODY.answers, lots: [] } }))
    expect(res.status).toBe(400)
  })

  it("retourne 403 si le projet n'appartient pas à l'utilisateur", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeUserClient(
        { data: null, error: { message: "not found" } },
        { data: NEW_DOC, error: null }
      )
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(makeAdmin())

    const res = await POST(req(VALID_BODY))
    expect(res.status).toBe(403)
  })

  it("retourne 500 si l'insertion du document échoue", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeUserClient(
        { data: PROJECT, error: null },
        { data: null, error: { message: "insert failed" } }
      )
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(makeAdmin())

    const res = await POST(req(VALID_BODY))
    expect(res.status).toBe(500)
  })

  it("retourne 500 si l'upload Storage échoue", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeUserClient({ data: PROJECT, error: null }, { data: NEW_DOC, error: null })
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({ message: "upload failed" })
    )

    const res = await POST(req(VALID_BODY))
    expect(res.status).toBe(500)
  })

  it("retourne 200 avec documentId et fileUrl en mode mock (pas d'ANTHROPIC_API_KEY)", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeUserClient({ data: PROJECT, error: null }, { data: NEW_DOC, error: null })
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(makeAdmin())

    const res = await POST(req(VALID_BODY))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.documentId).toBe("doc-new-1")
    expect(body.fileUrl).toBe("https://cdn.example.com/cctp.docx")
  })
})
