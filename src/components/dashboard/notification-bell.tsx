"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Notification } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface NotificationBellProps {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  popoverAlign?: "start" | "center" | "end"
}

const typeIcon: Record<string, string> = {
  document_approved: "✅",
  document_rejected: "❌",
  message_received: "💬",
  task_assigned: "📋",
}

export function NotificationBell({
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  popoverAlign = "end",
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleClick = async (notif: Notification) => {
    setOpen(false)
    await markAsRead(notif.id)
    if (notif.link) router.push(notif.link)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align={popoverAlign}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="font-semibold text-sm">Notifications</p>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-100">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                    !notif.read && "bg-primary/5"
                  )}
                >
                  <span className="text-lg shrink-0 mt-0.5">{typeIcon[notif.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className={cn("text-sm leading-tight", !notif.read && "font-semibold")}>
                      {notif.title}
                    </p>
                    {notif.body && (
                      <p className="text-xs text-muted-foreground truncate">{notif.body}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
