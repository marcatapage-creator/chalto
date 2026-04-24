import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as adminModule from "@/lib/supabase/admin"
import * as notificationsModule from "@/lib/notifications"

vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/notifications")

const uuid = "123e4567-e89b-12d3-a456-426614174000"

function req(body: unknown) {
  return new Request("http://localhost/api/task-comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

type Mode = "select" | "update" | "insert"

function tableChain(
  selectResult: unknown,
  updateResult: unknown = { error: null },
  insertResult: unknown = { data: null, error: null }
) {
  function chain(mode: Mode): Record<string, unknown> {
    const value = mode === "update" ? updateResult : mode === "insert" ? insertResult : selectResult
    return {
      select: () => chain(mode),
      eq: () => chain(mode),
      order: () => chain(mode),
      update: () => chain("update"),
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
        { error: null },
        { data: t.insertData ?? null, error: t.insertError ?? null }
      )
    },
  } as unknown as ReturnType<typeof adminModule.createAdminClient>
}

const TASK = { project_id: "proj-1", title: "Poser le carrelage" }
const CONTRIBUTOR = { id: "contrib-1" }
const COMMENT = {
  id: "comment-1",
  task_id: uuid,
  author_name: "Alice",
  author_role: "prestataire",
  content: "Fait !",
  created_at: new Date().toISOString(),
}
const PROJECT = { user_id: "user-1" }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(notificationsModule.createNotification).mockResolvedValue(undefined)
})

describe("POST /api/task-comment", () => {
  it("retourne 400 si le corps est invalide", async () => {
    const res = await POST(
      req({ taskId: uuid, authorName: "", content: "ok", contributorToken: "tok" })
    )
    expect(res.status).toBe(400)
  })

  it("retourne 404 si la tâche est introuvable", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(makeAdmin({ tasks: { data: null } }))
    const res = await POST(
      req({ taskId: uuid, authorName: "Alice", content: "Note", contributorToken: "tok" })
    )
    expect(res.status).toBe(404)
  })

  it("retourne 403 si le token ne correspond pas au projet", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        tasks: { data: TASK },
        contributors: { data: null },
      })
    )
    const res = await POST(
      req({ taskId: uuid, authorName: "Alice", content: "Note", contributorToken: "bad" })
    )
    expect(res.status).toBe(403)
  })

  it("retourne 200 et renvoie le commentaire créé", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        tasks: { data: TASK },
        contributors: { data: CONTRIBUTOR },
        task_comments: { insertData: COMMENT },
        projects: { data: PROJECT },
      })
    )
    const res = await POST(
      req({ taskId: uuid, authorName: "Alice", content: "Fait !", contributorToken: "tok" })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.comment).toMatchObject({ author_name: "Alice" })
  })

  it("crée une notification pour le pro après envoi d'un commentaire", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        tasks: { data: TASK },
        contributors: { data: CONTRIBUTOR },
        task_comments: { insertData: COMMENT },
        projects: { data: PROJECT },
      })
    )
    await POST(
      req({ taskId: uuid, authorName: "Alice", content: "Fait !", contributorToken: "tok" })
    )
    expect(notificationsModule.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "message_received", userId: "user-1" })
    )
  })

  it("retourne 500 si l'insertion en base échoue", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        tasks: { data: TASK },
        contributors: { data: CONTRIBUTOR },
        task_comments: { insertError: { message: "DB error" } },
      })
    )
    const res = await POST(
      req({ taskId: uuid, authorName: "Alice", content: "Note", contributorToken: "tok" })
    )
    expect(res.status).toBe(500)
  })
})
