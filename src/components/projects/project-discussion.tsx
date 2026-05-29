"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Users, ChevronDown, Mic } from "lucide-react"
import { cn, initials } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { MeetingRecorder } from "@/components/projects/meeting-recorder"
import { MeetingReportCard } from "@/components/projects/meeting-report-card"
import type { Meeting } from "@/types/index"

interface Message {
  id: string
  author_name: string
  author_role: "pro" | "prestataire"
  content: string
  created_at: string
}

type FeedItem = { kind: "message"; data: Message } | { kind: "meeting"; data: Meeting }

interface ProjectDiscussionProps {
  projectId: string
  authorName: string
  authorRole: "pro" | "prestataire"
  readOnly?: boolean
  onSend?: (content: string) => Promise<Message | null>
  autoOpen?: boolean
  highlighted?: boolean
  controlledOpen?: boolean
  onControlledOpenChange?: (v: boolean) => void
  onCountChange?: (count: number) => void
  onOpen?: () => void
  onClose?: () => void
  collapseSignal?: number
  expandSignal?: number
  unreadCount?: number
}

export function ProjectDiscussion({
  projectId,
  authorName,
  authorRole,
  readOnly = false,
  onSend,
  autoOpen = false,
  highlighted = false,
  controlledOpen,
  onControlledOpenChange,
  onCountChange,
  onOpen,
  onClose,
  collapseSignal,
  expandSignal,
  unreadCount = 0,
}: ProjectDiscussionProps) {
  const PAGE_SIZE = 50
  const [messages, setMessages] = useState<Message[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [internalContributors, setInternalContributors] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [recorderOpen, setRecorderOpen] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [internalOpen, setInternalOpen] = useState(autoOpen)
  const [localUnread, setLocalUnread] = useState(unreadCount)
  const open = controlledOpen ?? internalOpen
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  const loadedCount = useRef(0)
  const supabase = useMemo(() => createClient(), [])
  const prevCollapseSignal = useRef(collapseSignal ?? 0)
  useEffect(() => {
    if (collapseSignal === undefined || collapseSignal === prevCollapseSignal.current) return
    prevCollapseSignal.current = collapseSignal
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInternalOpen(false)
    onControlledOpenChange?.(false)
  }, [collapseSignal, onControlledOpenChange])
  const prevExpandSignal = useRef(expandSignal ?? 0)
  useEffect(() => {
    if (expandSignal === undefined || expandSignal === prevExpandSignal.current) return
    prevExpandSignal.current = expandSignal
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInternalOpen(true)
    onControlledOpenChange?.(true)
  }, [expandSignal, onControlledOpenChange])

  const handleToggle = () => {
    const next = !open
    if (next) {
      setLocalUnread(0)
      onOpen?.()
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      }, 280)
    } else {
      onClose?.()
    }
    setInternalOpen(next)
    onControlledOpenChange?.(next)
  }

  useEffect(() => {
    onCountChange?.(totalCount)
  }, [totalCount, onCountChange])

  useEffect(() => {
    supabase
      .from("project_messages")
      .select("*", { count: "exact" })
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE)
      .then(({ data, count }) => {
        if (data) {
          setMessages([...(data as unknown as Message[])].reverse())
          loadedCount.current = data.length
          const total = count ?? 0
          setTotalCount(total)
          setHasMore(total > PAGE_SIZE)
        }
      })

    const channel = supabase
      .channel(`project-discussion:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const incoming = payload.new as Message
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          )
          loadedCount.current += 1
          setTotalCount((n) => n + 1)
          if (incoming.author_role === "prestataire") {
            setLocalUnread((n) => n + 1)
          }
        }
      )
      .subscribe((_status, err) => {
        if (err) console.error("[project-discussion] Realtime error:", err)
      })

    return () => {
      void channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase])

  // Fetch contributors for the meeting recorder
  useEffect(() => {
    if (authorRole !== "pro") return
    supabase
      .from("contributors")
      .select("id, name")
      .eq("project_id", projectId)
      .then(({ data }) => {
        if (data) setInternalContributors(data as Array<{ id: string; name: string }>)
      })
  }, [projectId, supabase, authorRole])

  // Fetch meeting reports
  useEffect(() => {
    supabase
      .from("meeting_reports")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMeetings(data as unknown as Meeting[])
      })

    const channel = supabase
      .channel(`meeting-reports:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "meeting_reports",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMeetings((prev) => {
              const incoming = payload.new as Meeting
              return prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
            })
          } else if (payload.eventType === "UPDATE") {
            setMeetings((prev) =>
              prev.map((m) => (m.id === payload.new.id ? (payload.new as Meeting) : m))
            )
          }
        }
      )
      .subscribe()

    return () => {
      void channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase])

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true)
    const { data: older } = await supabase
      .from("project_messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .range(loadedCount.current, loadedCount.current + PAGE_SIZE - 1)
    if (older) {
      setMessages((prev) => [...(older as unknown as Message[]).reverse(), ...prev])
      loadedCount.current += older.length
      setHasMore(older.length === PAGE_SIZE)
    }
    setLoadingMore(false)
  }, [projectId, supabase])

  useEffect(() => {
    if (!open || messages.length === 0) return
    if (autoOpen) {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [messages, open, autoOpen])

  useEffect(() => {
    if (!highlighted) return
    const tOpen = setTimeout(() => setInternalOpen(true), 0)
    const tScroll = setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 350)
    return () => {
      clearTimeout(tOpen)
      clearTimeout(tScroll)
    }
  }, [highlighted])

  const handleSend = async () => {
    if (!content.trim()) return
    setLoading(true)

    if (onSend) {
      const newMsg = await onSend(content.trim())
      if (newMsg)
        setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]))
    } else {
      const { data: newMsg } = await supabase
        .from("project_messages")
        .insert({
          project_id: projectId,
          author_name: authorName,
          author_role: authorRole,
          content: content.trim(),
        })
        .select()
        .single()

      if (newMsg) {
        const msg = newMsg as unknown as Message
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      }
    }

    setContent("")
    setLoading(false)
  }

  // Fil fusionné messages + CRs, trié chronologiquement
  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [
      ...messages.map((m) => ({ kind: "message" as const, data: m })),
      ...meetings.map((m) => ({ kind: "meeting" as const, data: m })),
    ]
    return items.sort(
      (a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime()
    )
  }, [messages, meetings])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return "À l'instant"
    if (hours < 24) return `Il y a ${hours}h`
    if (days === 1) return "Hier"
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <>
      {authorRole === "pro" && (
        <MeetingRecorder
          open={recorderOpen}
          onClose={() => setRecorderOpen(false)}
          projectId={projectId}
          authorName={authorName}
          contributors={internalContributors}
          onMeetingCreated={(meeting) => {
            setMeetings((prev) =>
              prev.some((m) => m.id === meeting.id) ? prev : [...prev, meeting]
            )
          }}
        />
      )}

      <div ref={containerRef} className="space-y-2">
        <div
          className="flex items-center justify-between group cursor-pointer active:opacity-75"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-md group-hover:bg-muted transition-colors">
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                !open && "-rotate-90"
              )}
            />
            <span className="font-semibold">Discussion chantier</span>
            <span
              className={cn(
                "inline-flex items-center justify-center text-xs h-5 min-w-5 rounded-full transition-colors",
                localUnread > 0
                  ? "bg-destructive text-destructive-foreground font-semibold"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {messages.length}
            </span>
          </div>
          {authorRole === "pro" && !readOnly && (
            <div className="pl-3" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" className="gap-1.5" onClick={() => setRecorderOpen(true)}>
                <Mic className="h-4 w-4" />
                <span className="hidden sm:inline">Nouvelle réunion</span>
              </Button>
            </div>
          )}
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="discussion"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-1">
                <div
                  className={cn(
                    "border rounded-xl overflow-hidden bg-white dark:bg-card max-w-2xl transition-all duration-500",
                    highlighted && "border-ring ring-3 ring-ring/50"
                  )}
                >
                  <div className="p-4 space-y-4">
                    <div className="space-y-3 max-h-87.5 overflow-y-auto pr-1">
                      {hasMore && (
                        <div className="flex justify-center pb-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLoadMore}
                            loading={loadingMore}
                            className="text-xs text-muted-foreground"
                          >
                            Charger les messages précédents
                          </Button>
                        </div>
                      )}
                      {feed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Users className="h-6 w-6 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Aucun message pour l&apos;instant
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Échangez avec votre équipe ici
                          </p>
                        </div>
                      ) : (
                        feed.map((item, index) => {
                          if (item.kind === "meeting") {
                            return (
                              <MeetingReportCard
                                key={`meeting-${item.data.id}`}
                                meeting={item.data}
                                onUpdated={(updated) =>
                                  setMeetings((prev) =>
                                    prev.map((m) => (m.id === updated.id ? updated : m))
                                  )
                                }
                              />
                            )
                          }

                          const msg = item.data
                          const isPro = msg.author_role === "pro"

                          // Calcul isFirst en ignorant les réunions
                          const prevMsg = feed
                            .slice(0, index)
                            .reverse()
                            .find((f) => f.kind === "message")
                          const isFirst =
                            !prevMsg ||
                            (prevMsg.data as Message).author_name !== msg.author_name ||
                            (prevMsg.data as Message).author_role !== msg.author_role

                          return (
                            <div
                              key={msg.id}
                              className={cn("flex gap-3", isPro ? "flex-row" : "flex-row-reverse")}
                            >
                              {isFirst ? (
                                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                                  <AvatarFallback
                                    className={cn(
                                      "text-xs font-medium",
                                      isPro
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {initials(msg.author_name)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="w-7 shrink-0" />
                              )}

                              <div
                                className={cn(
                                  "flex flex-col gap-1 max-w-[75%]",
                                  isPro ? "items-start" : "items-end"
                                )}
                              >
                                {isFirst && (
                                  <div className="flex items-center gap-2 px-1">
                                    <span className="text-xs font-medium">{msg.author_name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(msg.created_at)}
                                    </span>
                                  </div>
                                )}
                                <div
                                  className={cn(
                                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                    isPro
                                      ? "bg-muted text-foreground rounded-tl-sm"
                                      : "bg-primary text-primary-foreground rounded-tr-sm"
                                  )}
                                >
                                  {msg.content}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                      <div ref={bottomRef} />
                    </div>

                    {!readOnly && (
                      <div ref={inputRef} className="border-t pt-3 space-y-2">
                        <Textarea
                          placeholder="Écrire à l'équipe... (Entrée pour envoyer)"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onFocus={(e) => {
                            const el = e.currentTarget
                            setTimeout(
                              () => el.scrollIntoView({ behavior: "smooth", block: "nearest" }),
                              300
                            )
                          }}
                          rows={2}
                          className="resize-none text-sm"
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={handleSend}
                            disabled={loading || !content.trim()}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
