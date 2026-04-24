import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as adminModule from "@/lib/supabase/admin"
import * as emailBrandModule from "@/lib/email-brand"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/supabase/admin")
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: vi.fn().mockResolvedValue({ id: "resend-id" }) }
  },
}))
vi.mock("@/lib/email-brand", () => ({ buildBrandHeader: vi.fn().mockReturnValue("") }))

const uuid = "123e4567-e89b-12d3-a456-426614174000"

function req(body: unknown) {
  return new Request("http://localhost/api/notify-task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

type Mode = "select" | "update" | "insert"

function tableChain(selectResult: unknown) {
  function chain(_mode: Mode): Record<string, unknown> {
    return {
      select: () => chain("select"),
      eq: () => chain("select"),
      single: () => Promise.resolve(selectResult),
      then: (f?: ((v: unknown) => unknown) | null, r?: ((e: unknown) => unknown) | null) =>
        Promise.resolve(selectResult).then(f, r),
    }
  }
  return chain("select")
}

function makeServerClient(user: unknown = { id: "user-1" }) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) } }
}

function makeAdmin(tables: Record<string, { data?: unknown }>) {
  return {
    from: (table: string) => tableChain({ data: tables[table]?.data ?? null, error: null }),
  } as unknown as ReturnType<typeof adminModule.createAdminClient>
}

const TASK = {
  id: uuid,
  title: "Pose du carrelage",
  description: null,
  due_date: null,
  project_id: "proj-1",
  assigned_to: "contact-1",
}
const CONTACT = { name: "Alice", email: "alice@example.com" }
const PROJECT = { name: "Rénovation", user_id: "user-1" }
const PROFILE = {
  full_name: "Jean Pro",
  company_name: null,
  logo_url: null,
  branding_enabled: false,
}
const CONTRIBUTOR = { invite_token: "tok-alice" }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(emailBrandModule.buildBrandHeader).mockReturnValue("")
})

describe("POST /api/notify-task", () => {
  it("retourne 400 si le corps est invalide", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient() as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(makeAdmin({}))
    const res = await POST(req({}))
    expect(res.status).toBe(400)
  })

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient(null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ taskId: uuid }))
    expect(res.status).toBe(401)
  })

  it("retourne 404 si la tâche est introuvable", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient() as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(makeAdmin({ tasks: { data: null } }))
    const res = await POST(req({ taskId: uuid }))
    expect(res.status).toBe(404)
  })

  it("retourne 403 si la tâche appartient à un autre pro", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient() as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        tasks: { data: TASK },
        contacts: { data: CONTACT },
        projects: { data: { ...PROJECT, user_id: "other-user" } },
        profiles: { data: PROFILE },
      })
    )
    const res = await POST(req({ taskId: uuid }))
    expect(res.status).toBe(403)
  })

  it("retourne 400 si le contact n'a pas d'email", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient() as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        tasks: { data: TASK },
        contacts: { data: { name: "Alice", email: null } },
        projects: { data: PROJECT },
        profiles: { data: PROFILE },
      })
    )
    const res = await POST(req({ taskId: uuid }))
    expect(res.status).toBe(400)
  })

  it("retourne 200 et envoie l'email de rappel", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient() as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        tasks: { data: TASK },
        contacts: { data: CONTACT },
        projects: { data: PROJECT },
        profiles: { data: PROFILE },
        contributors: { data: CONTRIBUTOR },
      })
    )
    const res = await POST(req({ taskId: uuid }))
    expect(res.status).toBe(200)
    expect((await res.json()).ok).toBe(true)
  })
})
