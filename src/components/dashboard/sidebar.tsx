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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { useNotifications } from "@/hooks/use-notifications"

import { useState, useEffect, useTransition, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Profile = {
  id: string
  full_name?: string | null
  email?: string | null
}

type Counts = { projects: number; contacts: number; deadlines: number }

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
                "relative flex items-center gap-3 px-3 rounded-lg font-medium transition-colors duration-150",
                instanceId === "mobile" ? "text-[18px] min-h-11 py-2" : "text-sm py-2.5",
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
  const [localDeadlines, setLocalDeadlines] = useState(counts.deadlines)
  const notifProps = useNotifications(userId)
  const supabase = useMemo(() => createClient(), [])

  const refreshDeadlines = useCallback(async () => {
    // admin_dossiers absent des types générés — cast nécessaire
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from("admin_dossiers")
      .select("id", { count: "exact", head: true })
      .not("status", "in", "(obtenu,refuse)")
      .not("deadline", "is", null)
    if (count !== null) setLocalDeadlines(count as number)
  }, [supabase])

  useEffect(() => {
    const channel = new BroadcastChannel("chalto:deadlines")
    channel.onmessage = () => {
      void refreshDeadlines()
    }
    return () => channel.close()
  }, [refreshDeadlines])

  const liveCounts = { ...counts, deadlines: localDeadlines }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden xl:flex w-64 border-r bg-card flex-col h-full">
        <SidebarContent
          profile={profile}
          counts={liveCounts}
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
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="xl:hidden fixed inset-0 z-50 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="xl:hidden fixed top-0 left-0 z-50 h-full w-72 bg-card border-r"
            >
              <SidebarContent
                profile={profile}
                counts={liveCounts}
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
