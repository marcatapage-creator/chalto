"use client"

import Link from "next/link"
import { AnimatedLogo } from "@/components/ui/animated-logo"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { LayoutDashboard, FolderOpen, Settings, LogOut, Menu, Users, LifeBuoy } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { useNotifications } from "@/hooks/use-notifications"

import { useState, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Profile = {
  id: string
  full_name?: string | null
  email?: string | null
}

type Counts = { projects: number; contacts: number }

type NotifProps = ReturnType<typeof useNotifications>

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, countKey: null },
  { label: "Projets", href: "/projects", icon: FolderOpen, countKey: "projects" as const },
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
}: {
  profile: Profile
  counts: Counts
  notifProps: NotifProps
  showBell?: boolean
  onNavigate?: () => void
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
            <AnimatedLogo width={28} height={28} />
            <span className="font-bold text-lg">Chalto</span>
          </div>
        </div>
        {showBell && <NotificationBell {...notifProps} popoverAlign="start" />}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 bg-muted dark:bg-transparent">
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
                "nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                isActive ? "active" : "text-muted-foreground",
                isPending && "opacity-60"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.countKey && (
                <span className="ml-auto inline-flex items-center justify-center text-xs bg-background text-muted-foreground h-5 min-w-5 rounded-full">
                  {counts[item.countKey]}
                </span>
              )}
              {isActive && !item.countKey && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground opacity-70" />
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
  const notifProps = useNotifications(userId)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden xl:flex w-64 border-r bg-card flex-col h-full">
        <SidebarContent profile={profile} counts={counts} notifProps={notifProps} />
      </aside>

      {/* Mobile/tablet header + burger */}
      <div className="xl:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b bg-card">
        <div className="flex items-center gap-2">
          <AnimatedLogo width={24} height={24} />
          <span className="font-bold">Chalto</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell {...notifProps} />
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
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
                counts={counts}
                notifProps={notifProps}
                showBell={false}
                onNavigate={() => setOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
