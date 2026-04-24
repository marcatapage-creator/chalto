import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as adminModule from "@/lib/supabase/admin"
import * as notificationsModule from "@/lib/notifications"

vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/notifications")

const uuid = "123e4567-e89b-12d3-a456-426614174000"

function req(body: unknown) {
  return new Request("http://localhost/api/project-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

type Mode = "select" | "update" | "insert"

function tableChain(selectResult: unknown, insertResult: unknown = { data: null, error: null }) {
  function chain(mode: Mode): Record<string, unknown> {
    const value = mode === "insert" ? insertResult : selectResult
    return {
      select: () => chain(mode),
      eq: () => chain(mode),
      insert: () => chain("insert"),
      single: () => Promise.resolve(value),
      then: (f?: ((v: unknown) => unknown) | null, r?: ((e: unknown) => unknown) | null) =>
        Promise.resolve(value).then(f, r),
    }
  }
  return chain("select")
}

function makeAdmin(
  tables: Record<string, { data?: unknown; insertData?: unknown; insertError?: unknown }>
) {
  return {
    from: (table: string) => {
      const t = tables[table] ?? {}
      return tableChain(
        { data: t.data ?? null, error: null },
        { data: t.insertData ?? null, error: t.insertError ?? null }
      )
    },
  } as unknown as ReturnType<typeof adminModule.createAdminClient>
}

const CONTRIBUTOR = { id: "contrib-1" }
const PROJECT = { user_id: "user-1" }
const MESSAGE = {
  id: "msg-1",
  content: "Bonjour",
  author_name: "Alice",
  author_role: "prestataire",
}

const validBody = {
  projectId: uuid,
  authorName: "Alice",
  content: "Bonjour !",
  contributorToken: "valid-tok",
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(notificationsModule.createNotification).mockResolvedValue(undefined)
})

describe("POST /api/project-message", () => {
  it("retourne 400 si le corps est invalide", async () => {
    const res = await POST(
      req({ projectId: uuid, authorName: "", content: "ok", contributorToken: "tok" })
    )
    expect(res.status).toBe(400)
  })

  it("retourne 403 si le token est invalide", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({ contributors: { data: null } })
    )
    const res = await POST(req(validBody))
    expect(res.status).toBe(403)
  })

  it("retourne 200 et renvoie le message créé", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        contributors: { data: CONTRIBUTOR },
        projects: { data: PROJECT },
        project_messages: { insertData: MESSAGE },
      })
    )
    const res = await POST(req(validBody))
    expect(res.status).toBe(200)
    expect((await res.json()).message).toMatchObject({ author_name: "Alice" })
  })

  it("envoie une notification au pro", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        contributors: { data: CONTRIBUTOR },
        projects: { data: PROJECT },
        project_messages: { insertData: MESSAGE },
      })
    )
    await POST(req(validBody))
    expect(notificationsModule.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "message_received", userId: "user-1" })
    )
  })

  it("retourne 500 si l'insertion échoue", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        contributors: { data: CONTRIBUTOR },
        projects: { data: PROJECT },
        project_messages: { insertError: { message: "DB error" } },
      })
    )
    const res = await POST(req(validBody))
    expect(res.status).toBe(500)
  })
})
