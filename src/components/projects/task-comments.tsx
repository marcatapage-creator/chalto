"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { FadeIn } from "@/components/ui/motion"

interface Comment {
  id: string
  author_name: string
  author_role: "pro" | "prestataire"
  content: string
  created_at: string
}

interface TaskCommentsProps {
  taskId: string
  authorName: string
  authorRole: "pro" | "prestataire"
}

export function TaskComments({ taskId, authorName, authorRole }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!open) return

    supabase
      .from("task_comments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setComments(data)
      })

    const channel = supabase
      .channel(`task-comments:${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "task_comments",
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          setComments((prev) => [...prev, payload.new as Comment])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [taskId, open, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [comments])

  const handleSend = async () => {
    if (!content.trim()) return
    setLoading(true)

    await supabase.from("task_comments").insert({
      task_id: taskId,
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

  return (
    <div className="border-t">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>
          {comments.length > 0
            ? `${comments.length} note${comments.length > 1 ? "s" : ""}`
            : "Ajouter une note"}
        </span>
      </button>

      {open && (
        <FadeIn className="px-3 pb-3 space-y-3">
          {/* Messages */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                Aucune note — démarrez la discussion
              </p>
            ) : (
              comments.map((comment) => {
                const isPro = comment.author_role === "pro"
                return (
                  <div
                    key={comment.id}
                    className={cn("flex gap-2", isPro ? "flex-row" : "flex-row-reverse")}
                  >
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          isPro
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {initials(comment.author_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "flex flex-col gap-0.5 max-w-[75%]",
                        isPro ? "items-start" : "items-end"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-xl px-3 py-1.5 text-xs leading-relaxed",
                          isPro ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                        )}
                      >
                        {comment.content}
                      </div>
                      <span className="text-xs text-muted-foreground px-1">
                        {comment.author_name} ·{" "}
                        {new Date(comment.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Écrire une note... (Entrée pour envoyer)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="resize-none text-xs min-h-[32px]"
            />
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleSend}
              disabled={loading || !content.trim()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
