"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, FolderOpen, Settings, LogOut, Building2, Menu, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { SlideIn } from "@/components/ui/motion"
import { useState } from "react"

type Profile = {
  full_name?: string | null
  email?: string | null
  professions?: { label: string; icon: string } | null
}

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projets", href: "/projects", icon: FolderOpen },
  { label: "Annuaire", href: "/contacts", icon: Users },
  { label: "Paramètres", href: "/settings", icon: Settings },
]

function SidebarContent({ profile, onNavigate }: { profile: Profile; onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

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
      <div className="p-6 md:pb-11">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Chalto</span>
        </div>
        {profile?.professions && (
          <p className="text-xs text-muted-foreground mt-1 ml-9">{profile.professions.label}</p>
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
              onClick={onNavigate}
              className={cn(
                "nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                isActive ? "active" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {isActive && (
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

export function Sidebar({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col h-full">
        <SidebarContent profile={profile} />
      </aside>

      {/* Mobile header + burger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">Chalto</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SlideIn className="h-full">
              <SidebarContent profile={profile} onNavigate={() => setOpen(false)} />
            </SlideIn>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
