"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

export interface ActionMenuItemDef {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  destructive?: boolean
  separator?: boolean
  disabled?: boolean
}

interface ActionMenuProps {
  trigger: React.ReactNode
  items: ActionMenuItemDef[]
  align?: "start" | "end" | "center"
}

// Desktop-first: starts as DropdownMenu (SSR-safe, no hydration mismatch).
// Switches to Drawer after mount only on mobile/tablet (< 1024px).
export function ActionMenu({ trigger, items, align = "end" }: ActionMenuProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(media.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [])

  const [drawerOpen, setDrawerOpen] = useState(false)

  if (!isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {item.separator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(item.destructive && "text-destructive focus:text-destructive")}
              >
                {item.icon}
                {item.label}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">Actions</DrawerTitle>
        <DrawerDescription className="sr-only">Choisissez une action</DrawerDescription>
        <div className="py-2 pb-6">
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {item.separator && <div className="my-1 h-px bg-border mx-4" />}
              <DrawerClose asChild>
                <button
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={cn(
                    "flex items-center gap-4 w-full px-6 py-4 text-base text-left active:bg-muted transition-colors",
                    item.destructive ? "text-destructive" : "text-foreground",
                    item.disabled && "opacity-50 pointer-events-none"
                  )}
                >
                  <span className="shrink-0 [&_svg]:h-5 [&_svg]:w-5">{item.icon}</span>
                  {item.label}
                </button>
              </DrawerClose>
            </React.Fragment>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
