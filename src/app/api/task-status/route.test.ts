import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as adminModule from "@/lib/supabase/admin"
import * as notificationsModule from "@/lib/notifications"

vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/notifications")
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn().mockResolvedValue(true) }))

const uuid = "123e4567-e89b-12d3-a456-426614174000"

function req(body: unknown) {
  return new Request("http://localhost/api/task-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

type Mode = "select" | "update" | "insert"

function tableChain(selectResult: unknown, updateResult: unknown = { error: null }) {
  function chain(mode: Mode): Record<string, unknown> {
    const value = mode === "update" ? updateResult : selectResult
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

function makeAdmin(tables: Record<string, { data?: unknown; updateError?: unknown }>) {
  return {
    from: (table: string) => {
      const t = tables[table] ?? {}
      return tableChain({ data: t.data ?? null, error: null }, { error: t.updateError ?? null })
    },
  } as unknown as ReturnType<typeof adminModule.createAdminClient>
}

const TASK = { project_id: "proj-1", title: "Installer les fenêtres" }
const CONTRIBUTOR = { id: "contrib-1", name: "Alice" }
const PROJECT = { user_id: "user-1" }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(notificationsModule.createNotification).mockResolvedValue(undefined)
})

describe("POST /api/task-status", () => {
  it("retourne 429 si la limite de taux est dépassée", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit")
    vi.mocked(checkRateLimit).mockResolvedValueOnce(false)
    const res = await POST(req({ taskId: uuid, status: "done", contributorToken: "tok" }))
    expect(res.status).toBe(429)
  })

  it("retourne 400 si le corps est invalide", async () => {
    const res = await POST(req({ taskId: "not-uuid", status: "done", contributorToken: "tok" }))
    expect(res.status).toBe(400)
  })

  it("retourne 400 si le statut est inconnu", async () => {
    const res = await POST(req({ taskId: uuid, status: "cancelled", contributorToken: "tok" }))
    expect(res.status).toBe(400)
  })

  it("retourne 404 si la tâche est introuvable", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(makeAdmin({ tasks: { data: null } }))
    const res = await POST(req({ taskId: uuid, status: "done", contributorToken: "tok" }))
    expect(res.status).toBe(404)
  })

  it("retourne 403 si le token ne correspond pas au projet", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        tasks: { data: TASK },
        contributors: { data: null },
      })
    )
    const res = await POST(req({ taskId: uuid, status: "done", contributorToken: "bad-token" }))
    expect(res.status).toBe(403)
  })

  it("retourne 200 et crée une notification", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        tasks: { data: TASK },
        contributors: { data: CONTRIBUTOR },
        projects: { data: PROJECT },
      })
    )
    const res = await POST(req({ taskId: uuid, status: "done", contributorToken: "valid-tok" }))
    expect(res.status).toBe(200)
    expect((await res.json()).ok).toBe(true)
  })

  it("retourne 500 si la mise à jour échoue", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        tasks: { data: TASK, updateError: { message: "DB error" } },
        contributors: { data: CONTRIBUTOR },
      })
    )
    const res = await POST(req({ taskId: uuid, status: "done", contributorToken: "tok" }))
    expect(res.status).toBe(500)
  })
})
