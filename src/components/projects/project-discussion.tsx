"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Users, ChevronDown } from "lucide-react"
import { cn, initials } from "@/lib/utils"
import { FadeIn } from "@/components/ui/motion"

interface Message {
  id: string
  author_name: string
  author_role: "pro" | "prestataire"
  content: string
  created_at: string
}

interface ProjectDiscussionProps {
  projectId: string
  authorName: string
  authorRole: "pro" | "prestataire"
}

export function ProjectDiscussion({ projectId, authorName, authorRole }: ProjectDiscussionProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase
      .from("project_messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data)
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
        }
      )
      .subscribe()

    return () => {
      void channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase])

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, open])

  const handleSend = async () => {
    if (!content.trim()) return
    setLoading(true)

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

    if (newMsg)
      setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]))

    setContent("")
    setLoading(false)
  }

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
    <div className="space-y-2">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 group">
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            !open && "-rotate-90"
          )}
        />
        <span className="font-semibold group-hover:text-foreground transition-colors">
          Discussion chantier
        </span>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {messages.length}
        </span>
        {messages.length > 0 && !open && (
          <span className="hidden sm:inline text-xs text-muted-foreground italic truncate max-w-37.5">
            — {messages[messages.length - 1].content}
          </span>
        )}
      </button>

      {open && (
        <FadeIn className="border rounded-xl overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="space-y-3 max-h-87.5 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aucun message pour l&apos;instant</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Échangez avec votre équipe ici
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isPro = msg.author_role === "pro"
                  const isFirst =
                    index === 0 ||
                    messages[index - 1].author_name !== msg.author_name ||
                    messages[index - 1].author_role !== msg.author_role

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

            <div className="border-t pt-3 space-y-2">
              <Textarea
                placeholder="Écrire à l'équipe... (Entrée pour envoyer)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                className="resize-none text-sm"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSend} disabled={loading || !content.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
