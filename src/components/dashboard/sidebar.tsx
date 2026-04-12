"use client"

import Link from "next/link"
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
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projets", href: "/projects", icon: FolderOpen },
  { label: "Paramètres", href: "/settings", icon: Settings },
]

export function Sidebar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : profile?.email?.slice(0, 2).toUpperCase()

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Chalto Pro</span>
        </div>
        {profile?.professions && (
          <p className="text-xs text-muted-foreground mt-1 ml-9">
            {profile.professions.label}
          </p>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
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
              <AvatarFallback className="text-xs bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium truncate max-w-[120px]">
                {profile?.full_name || profile?.email}
              </span>
            </div>
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
    </aside>
  )
}
