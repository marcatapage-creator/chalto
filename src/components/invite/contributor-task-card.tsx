"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Clock, ArrowRight } from "lucide-react"
import { TaskComments } from "@/components/projects/task-comments"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  due_date?: string
  assigned_to?: string
}

const statusConfig: Record<
  string,
  { label: string; color: string; next?: string; nextLabel?: string }
> = {
  todo: {
    label: "À faire",
    color: "bg-muted text-muted-foreground",
    next: "in_progress",
    nextLabel: "Démarrer",
  },
  in_progress: {
    label: "En cours",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    next: "done",
    nextLabel: "Terminer",
  },
  done: {
    label: "Terminé",
    color: "bg-primary/10 text-primary",
  },
}

interface ContributorTaskCardProps {
  task: Task
  onStatusChange: (taskId: string, newStatus: string) => void
  authorName: string
  authorRole: "pro" | "prestataire"
  contributorToken: string
  initialComments?: {
    id: string
    author_name: string
    author_role: "pro" | "prestataire"
    content: string
    created_at: string
  }[]
}

export function ContributorTaskCard({
  task,
  onStatusChange,
  authorName,
  authorRole,
  contributorToken,
  initialComments,
}: ContributorTaskCardProps) {
  const config = statusConfig[task.status] ?? statusConfig.todo

  return (
    <Card className={cn("transition-all duration-200", task.status === "done" && "opacity-70")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={cn(
                "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all",
                task.status === "done"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground hover:border-primary"
              )}
              onClick={() => task.status !== "done" && onStatusChange(task.id, "done")}
            >
              {task.status === "done" && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>

            <div className="flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  task.status === "done" && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
              )}
              {task.due_date && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(task.due_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Badge className={cn("text-xs shrink-0", config.color)}>{config.label}</Badge>
        </div>

        {config.next && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs text-muted-foreground hover:text-foreground mt-2"
            onClick={() => onStatusChange(task.id, config.next!)}
          >
            {config.nextLabel}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </CardContent>
      <TaskComments
        taskId={task.id}
        authorName={authorName}
        authorRole={authorRole}
        contributorToken={contributorToken}
        initialComments={initialComments}
      />
    </Card>
  )
}
