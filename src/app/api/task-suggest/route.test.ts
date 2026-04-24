import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as adminModule from "@/lib/supabase/admin"
import * as notificationsModule from "@/lib/notifications"

vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/notifications")
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn().mockResolvedValue(true) }))

const uuid = "123e4567-e89b-12d3-a456-426614174000"

function req(body: unknown) {
  return new Request("http://localhost/api/task-suggest", {
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
      update: () => chain("update"),
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

const CONTRIBUTOR = { id: "contrib-1", contact_id: "contact-1" }
const PROJECT = { user_id: "user-1" }
const TASK = { id: "task-1", title: "Poser les cloisons" }

const validBody = {
  projectId: uuid,
  title: "Poser les cloisons",
  contributorToken: "valid-tok",
  contributorName: "Alice",
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(notificationsModule.createNotification).mockResolvedValue(undefined)
})

describe("POST /api/task-suggest", () => {
  it("retourne 429 si la limite de taux est dépassée", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit")
    vi.mocked(checkRateLimit).mockResolvedValueOnce(false)
    const res = await POST(
      req({ projectId: uuid, title: "Test", contributorToken: "tok", contributorName: "Alice" })
    )
    expect(res.status).toBe(429)
  })

  it("retourne 400 si le corps est invalide", async () => {
    const res = await POST(
      req({ projectId: uuid, title: "", contributorToken: "tok", contributorName: "Alice" })
    )
    expect(res.status).toBe(400)
  })

  it("retourne 403 si le token ne correspond pas", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({ contributors: { data: null } })
    )
    const res = await POST(req(validBody))
    expect(res.status).toBe(403)
  })

  it("retourne 200 et crée la tâche suggestion", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        contributors: { data: CONTRIBUTOR },
        projects: { data: PROJECT },
        tasks: { insertData: TASK },
      })
    )
    const res = await POST(req(validBody))
    expect(res.status).toBe(200)
    expect((await res.json()).task).toMatchObject({ id: "task-1" })
  })

  it("envoie une notification au pro après suggestion", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        contributors: { data: CONTRIBUTOR },
        projects: { data: PROJECT },
        tasks: { insertData: TASK },
      })
    )
    await POST(req(validBody))
    expect(notificationsModule.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "task_assigned", userId: "user-1" })
    )
  })

  it("retourne 500 si l'insertion échoue", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        contributors: { data: CONTRIBUTOR },
        projects: { data: PROJECT },
        tasks: { insertError: { message: "DB error" } },
      })
    )
    const res = await POST(req(validBody))
    expect(res.status).toBe(500)
  })
})
