"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Users } from "lucide-react"
import { cn } from "@/lib/utils"
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
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!content.trim()) return
    setLoading(true)

    await supabase.from("project_messages").insert({
      project_id: projectId,
      author_name: authorName,
      author_role: authorRole,
      content: content.trim(),
    })

    setContent("")
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Discussion chantier
          {messages.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">({messages.length})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {/* Messages */}
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucun message pour l&apos;instant</p>
              <p className="text-xs text-muted-foreground mt-1">Échangez avec votre équipe ici</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isPro = msg.author_role === "pro"
              const isFirst = index === 0 || messages[index - 1].author_name !== msg.author_name

              return (
                <FadeIn key={msg.id}>
                  <div className={cn("flex gap-3", isPro ? "flex-row" : "flex-row-reverse")}>
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
                </FadeIn>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
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
      </CardContent>
    </Card>
  )
}
