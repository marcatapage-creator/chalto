import { describe, it, expect, vi, beforeEach } from "vitest"
import { createNotification } from "../notifications"
import * as adminModule from "@/lib/supabase/admin"

vi.mock("@/lib/supabase/admin")

function tableChain(selectResult: unknown, insertResult: unknown = { error: null }) {
  type Mode = "select" | "insert"
  function chain(mode: Mode): Record<string, unknown> {
    const value = mode === "insert" ? insertResult : selectResult
    return {
      select: () => chain("select"),
      eq: () => chain(mode),
      insert: () => chain("insert"),
      single: () => Promise.resolve(value),
      then: (f?: ((v: unknown) => unknown) | null, r?: ((e: unknown) => unknown) | null) =>
        Promise.resolve(value).then(f, r),
    }
  }
  return chain("select")
}

function makeAdmin(profileData: unknown = null, insertError: unknown = null) {
  return {
    from: (table: string) =>
      table === "profiles"
        ? tableChain({ data: profileData })
        : tableChain({ data: null }, { error: insertError }),
  } as unknown as ReturnType<typeof adminModule.createAdminClient>
}

beforeEach(() => vi.clearAllMocks())

describe("createNotification", () => {
  it("insère la notification si inAppEnabled est true", async () => {
    const admin = makeAdmin()
    const insertSpy = vi.spyOn(admin, "from")
    vi.mocked(adminModule.createAdminClient).mockReturnValue(admin)

    await createNotification({
      userId: "user-1",
      type: "document_approved",
      title: "Document approuvé",
      inAppEnabled: true,
    })

    expect(insertSpy).toHaveBeenCalledWith("notifications")
  })

  it("n'insère pas si inAppEnabled est false", async () => {
    const admin = makeAdmin()
    const insertSpy = vi.spyOn(admin, "from")
    vi.mocked(adminModule.createAdminClient).mockReturnValue(admin)

    await createNotification({
      userId: "user-1",
      type: "document_approved",
      title: "Document approuvé",
      inAppEnabled: false,
    })

    expect(insertSpy).not.toHaveBeenCalledWith("notifications")
  })

  it("interroge le profil si inAppEnabled est undefined", async () => {
    const admin = makeAdmin({ notif_inapp_enabled: true })
    const fromSpy = vi.spyOn(admin, "from")
    vi.mocked(adminModule.createAdminClient).mockReturnValue(admin)

    await createNotification({
      userId: "user-1",
      type: "task_assigned",
      title: "Tâche assignée",
    })

    expect(fromSpy).toHaveBeenCalledWith("profiles")
    expect(fromSpy).toHaveBeenCalledWith("notifications")
  })

  it("n'insère pas si le profil a notif_inapp_enabled false", async () => {
    const admin = makeAdmin({ notif_inapp_enabled: false })
    const fromSpy = vi.spyOn(admin, "from")
    vi.mocked(adminModule.createAdminClient).mockReturnValue(admin)

    await createNotification({
      userId: "user-1",
      type: "message_received",
      title: "Message reçu",
    })

    expect(fromSpy).not.toHaveBeenCalledWith("notifications")
  })

  it("insère si le profil n'a pas de préférence définie (null)", async () => {
    const admin = makeAdmin({ notif_inapp_enabled: null })
    const fromSpy = vi.spyOn(admin, "from")
    vi.mocked(adminModule.createAdminClient).mockReturnValue(admin)

    await createNotification({
      userId: "user-1",
      type: "document_rejected",
      title: "Document refusé",
    })

    expect(fromSpy).toHaveBeenCalledWith("notifications")
  })
})
