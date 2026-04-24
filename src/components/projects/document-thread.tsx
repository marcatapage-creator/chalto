"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { FadeIn } from "@/components/ui/motion"

interface Message {
  id: string
  author_name: string
  author_role: "pro" | "client"
  content: string
  created_at: string
}

interface DocumentThreadProps {
  documentId: string
  authorName: string
  authorRole: "pro" | "client"
}

export function DocumentThread({ documentId, authorName, authorRole }: DocumentThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: true })

      if (data) setMessages(data)
    }

    fetchMessages()

    const channel = supabase
      .channel(`messages:${documentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `document_id=eq.${documentId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe((_status, err) => {
        if (err) console.error("[messages] Realtime error:", err)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [documentId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!content.trim()) return
    setLoading(true)

    await supabase.from("messages").insert({
      document_id: documentId,
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
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 min-h-50 max-h-100">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Aucun message — démarrez la discussion</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isPro = msg.author_role === "pro"
            const initials = msg.author_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)

            return (
              <FadeIn key={msg.id}>
                <div className={cn("flex gap-3", isPro ? "flex-row" : "flex-row-reverse")}>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback
                      className={cn(
                        "text-xs",
                        isPro ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "flex flex-col gap-1 max-w-[75%]",
                      isPro ? "items-start" : "items-end"
                    )}
                  >
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
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xs text-muted-foreground">{msg.author_name}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
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
      <div className="border-t p-4 space-y-2">
        <Textarea
          placeholder="Écrire un message... (Entrée pour envoyer)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSend} disabled={!content.trim()} loading={loading}>
            <Send className="h-4 w-4 mr-2" />
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  )
}
