"use client"

import Link from "next/link"
import { AnimatedLogo } from "@/components/ui/animated-logo"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  Users,
  LifeBuoy,
  CalendarDays,
  Zap,
} from "lucide-react"
import { PLAN_LIMITS, PLAN_LABEL, type Plan } from "@/types/index"
import { UpgradeModal } from "@/components/dashboard/upgrade-modal"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { useNotifications } from "@/hooks/use-notifications"
import { useRealtimeChannel } from "@/hooks/use-realtime-channel"

import { useState, useEffect, useTransition, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Profile = {
  id: string
  full_name?: string | null
  email?: string | null
  plan?: string | null
}

type Counts = { projects: number; contacts: number; deadlines: number }

function PlanWidget({ userId }: { userId: string }) {
  const supabase = useMemo(() => createClient(), [])
  const [plan, setPlan] = useState<string | null>(null)
  const [activeProjects, setActiveProjects] = useState<number | null>(null)
  const [aiDocsThisMonth, setAiDocsThisMonth] = useState<number | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  useEffect(() => {
    void (async () => {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const [{ data: profileData }, { count: projCount }, { data: userProjects }] =
        await Promise.all([
          supabase.from("profiles").select("plan").eq("id", userId).single(),
          supabase
            .from("projects")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("status", "active"),
          supabase.from("projects").select("id").eq("user_id", userId),
        ])

      setPlan(profileData?.plan ?? "free")
      setActiveProjects(projCount ?? 0)

      if (!userProjects?.length) {
        setAiDocsThisMonth(0)
        return
      }
      const projectIds = userProjects.map((p) => p.id)
      const { count: aiCount } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .in("project_id", projectIds)
        .eq("ai_generated", true)
        .gte("created_at", startOfMonth.toISOString())
      setAiDocsThisMonth(aiCount ?? 0)
    })()
  }, [userId, supabase])

  // Polling : si le plan est encore "free", on re-vérifie toutes les 2s
  // pendant 30s max — couvre le délai entre le redirect Stripe et le webhook
  useEffect(() => {
    if (plan !== "free") return
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const { data } = await supabase.from("profiles").select("plan").eq("id", userId).single()
      if (data?.plan && data.plan !== "free") {
        setPlan(data.plan)
        clearInterval(interval)
      }
      if (attempts >= 15) clearInterval(interval)
    }, 2000)
    return () => clearInterval(interval)
  }, [plan, userId, supabase])

  // Plan pas encore chargé ou user payant → ne rien afficher
  if (plan === null || plan !== "free") return null

  const limits = PLAN_LIMITS["free" as Plan]
  const projectPct =
    activeProjects !== null ? Math.min((activeProjects / limits.maxActiveProjects) * 100, 100) : 0
  const aiPct =
    aiDocsThisMonth !== null ? Math.min((aiDocsThisMonth / limits.maxAiDocsPerMonth) * 100, 100) : 0
  const atLimit = projectPct >= 100 || aiPct >= 100

  return (
    <>
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <div
        className={cn(
          "rounded-lg border p-3 space-y-2.5 text-xs",
          atLimit
            ? "border-amber-400/60 bg-amber-50/60 dark:bg-amber-950/30"
            : "border-border bg-muted/40"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
            {PLAN_LABEL["free"]}
          </span>
          <button
            onClick={() => setUpgradeOpen(true)}
            className={cn(
              "flex items-center gap-1 font-medium transition-colors",
              atLimit
                ? "text-amber-600 dark:text-amber-400 hover:text-amber-700"
                : "text-primary hover:text-primary/80"
            )}
          >
            <Zap className="h-3 w-3" />
            Passer à Solo
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-muted-foreground">
            <span>Projets actifs</span>
            <span
              className={cn(projectPct >= 100 && "text-amber-600 dark:text-amber-400 font-medium")}
            >
              {activeProjects ?? "…"} / {limits.maxActiveProjects}
            </span>
          </div>
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                projectPct >= 100 ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${projectPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-muted-foreground">
            <span>IA ce mois</span>
            <span className={cn(aiPct >= 100 && "text-amber-600 dark:text-amber-400 font-medium")}>
              {aiDocsThisMonth ?? "…"} / {limits.maxAiDocsPerMonth}
            </span>
          </div>
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                aiPct >= 100 ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${aiPct}%` }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

type NotifProps = ReturnType<typeof useNotifications>

const navigation = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, countKey: null },
  { label: "Projets", href: "/projects", icon: FolderOpen, countKey: "projects" as const },
  { label: "Échéances", href: "/deadlines", icon: CalendarDays, countKey: "deadlines" as const },
  { label: "Annuaire", href: "/contacts", icon: Users, countKey: "contacts" as const },
  { label: "Paramètres", href: "/settings", icon: Settings, countKey: null },
  { label: "Support", href: "/support", icon: LifeBuoy, countKey: null },
]

function SidebarContent({
  profile,
  counts,
  notifProps,
  showBell = true,
  onNavigate,
  instanceId,
}: {
  profile: Profile
  counts: Counts
  notifProps: NotifProps
  showBell?: boolean
  onNavigate?: () => void
  instanceId: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    router.prefetch("/dashboard")
    router.prefetch("/projects")
    router.prefetch("/contacts")
    router.prefetch("/settings")
    router.prefetch("/support")
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : profile?.email?.slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 min-h-25 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AnimatedLogo
              width={instanceId === "mobile" ? 35 : 28}
              height={instanceId === "mobile" ? 35 : 28}
              noEntrance={instanceId === "mobile"}
            />
            <span className={`font-bold ${instanceId === "mobile" ? "text-[22px]" : "text-lg"}`}>
              Chalto
            </span>
          </div>
        </div>
        {showBell && <NotificationBell {...notifProps} popoverAlign="start" />}
      </div>

      <Separator />

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 p-4 bg-muted dark:bg-transparent",
          instanceId === "mobile" ? "space-y-2" : "space-y-1"
        )}
      >
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                startTransition(() => {})
                onNavigate?.()
              }}
              className={cn(
                "relative flex items-center gap-3 px-3 rounded-lg font-medium transition-[color,background-color,transform] duration-150",
                instanceId === "mobile"
                  ? "text-[18px] min-h-11 py-2 touch-manipulation active:scale-[0.97] active:bg-black/12 dark:active:bg-white/12"
                  : "text-sm py-2.5",
                isActive
                  ? "text-[hsl(0,0%,98%)] dark:text-[hsl(0,0%,9%)]"
                  : "text-muted-foreground hover:bg-black/8 dark:hover:bg-white/8 hover:text-foreground",
                isPending && "opacity-60"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={`nav-pill-${instanceId}`}
                  className="absolute inset-0 rounded-lg bg-[hsl(0,0%,9%)] dark:bg-[hsl(0,0%,98%)]"
                  transition={{ type: "spring", stiffness: 400, damping: 38 }}
                />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{item.label}</span>
              {item.countKey && (
                <span className="relative ml-auto inline-flex items-center justify-center text-xs bg-background text-muted-foreground h-5 min-w-5 rounded-full">
                  {counts[item.countKey]}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4 space-y-3">
        {/* Plan widget — se cache lui-même si l'user est payant */}
        <PlanWidget userId={profile.id} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium truncate max-w-30">
              {profile?.full_name || profile?.email}
            </span>
          </div>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}

export function Sidebar({
  profile,
  counts,
  userId,
}: {
  profile: Profile
  counts: Counts
  userId: string
}) {
  const [open, setOpen] = useState(false)
  const [localCounts, setLocalCounts] = useState(counts)
  const notifProps = useNotifications(userId)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    void (async () => {
      const [{ count: projects }, { count: contacts }, { count: deadlines }] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", userId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("admin_dossiers")
          .select("id", { count: "exact", head: true })
          .not("status", "in", "(obtenu,refuse)")
          .not("deadline", "is", null),
      ])
      setLocalCounts({
        projects: projects ?? 0,
        contacts: contacts ?? 0,
        deadlines: deadlines ?? 0,
      })
    })()
  }, [userId, supabase])

  const refreshDeadlines = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from("admin_dossiers")
      .select("id", { count: "exact", head: true })
      .not("status", "in", "(obtenu,refuse)")
      .not("deadline", "is", null)
    if (count !== null) setLocalCounts((prev) => ({ ...prev, deadlines: count as number }))
  }, [supabase])

  useEffect(() => {
    const channel = new BroadcastChannel("chalto:deadlines")
    channel.onmessage = () => void refreshDeadlines()
    return () => channel.close()
  }, [refreshDeadlines])

  const setupSidebarChannel = useCallback(
    (ch: ReturnType<typeof supabase.channel>) =>
      ch
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "projects", filter: `user_id=eq.${userId}` },
          () => setLocalCounts((prev) => ({ ...prev, projects: prev.projects + 1 }))
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "projects", filter: `user_id=eq.${userId}` },
          () => setLocalCounts((prev) => ({ ...prev, projects: Math.max(0, prev.projects - 1) }))
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "contacts", filter: `user_id=eq.${userId}` },
          () => setLocalCounts((prev) => ({ ...prev, contacts: prev.contacts + 1 }))
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "contacts", filter: `user_id=eq.${userId}` },
          () => setLocalCounts((prev) => ({ ...prev, contacts: Math.max(0, prev.contacts - 1) }))
        ),
    [userId, supabase]
  )

  useRealtimeChannel(supabase, `sidebar-counts:${userId}`, setupSidebarChannel)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden xl:flex w-64 border-r bg-card flex-col h-full">
        <SidebarContent
          profile={profile}
          counts={localCounts}
          notifProps={notifProps}
          instanceId="desktop"
        />
      </aside>

      {/* Mobile/tablet header + burger */}
      <div
        data-no-ptr
        className="xl:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-18.5 border-b bg-card"
      >
        <div className="flex items-center gap-2">
          <AnimatedLogo width={28} height={28} />
          <span className="font-bold text-lg">Chalto</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell {...notifProps} buttonClassName="border-0" />
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="border-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <line
                x1="3"
                y1="4"
                x2="17"
                y2="4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="16"
                x2="17"
                y2="16"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, pointerEvents: "auto" }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={{ duration: 0.25 }}
              className="xl:hidden fixed inset-0 z-50 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0, pointerEvents: "auto" }}
              exit={{ x: "-100%", pointerEvents: "none" }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="xl:hidden fixed top-0 left-0 z-50 h-full w-72 bg-card border-r"
            >
              <SidebarContent
                profile={profile}
                counts={localCounts}
                notifProps={notifProps}
                showBell={false}
                onNavigate={() => setOpen(false)}
                instanceId="mobile"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
