"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ContributorHeaderProps {
  logoUrl?: string | null
  companyName?: string | null
  docsCount: number
  tasksCount: number
  discussionCount: number
  docsRead: boolean
  tasksRead: boolean
  discussionRead: boolean
  onDocsClick: () => void
  onTasksClick: () => void
  onDiscussionClick: () => void
}

export function ContributorHeader({
  logoUrl,
  companyName,
  docsCount,
  tasksCount,
  discussionCount,
  docsRead,
  tasksRead,
  discussionRead,
  onDocsClick,
  onTasksClick,
  onDiscussionClick,
}: ContributorHeaderProps) {
  return (
    <div className="sticky top-0 z-20">
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={companyName ?? "Logo"}
              width={120}
              height={32}
              className="object-contain max-h-8"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Image src="/Logo.svg" alt="Chalto" width={24} height={24} />
              <span className="font-bold">Chalto</span>
            </div>
          )}
          <Badge variant="outline" className="text-xs">
            Espace prestataire
          </Badge>
        </div>
      </header>

      <nav className="bg-background/95 backdrop-blur border-b">
        <div className="max-w-2xl mx-auto px-4 flex">
          <button
            onClick={onDocsClick}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-w-0 flex-1 justify-center"
          >
            <span className="truncate">Documents</span>
            {docsCount > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center h-5 min-w-5 rounded-full text-xs leading-none shrink-0 px-1",
                  docsRead ? "bg-muted" : "bg-red-500 text-white"
                )}
              >
                {docsCount}
              </span>
            )}
          </button>
          <button
            onClick={onTasksClick}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-w-0 flex-1 justify-center"
          >
            <span className="truncate">Tâches</span>
            {tasksCount > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center h-5 min-w-5 rounded-full text-xs leading-none shrink-0 px-1",
                  tasksRead ? "bg-muted" : "bg-red-500 text-white"
                )}
              >
                {tasksCount}
              </span>
            )}
          </button>
          <button
            onClick={onDiscussionClick}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-w-0 flex-1 justify-center"
          >
            <span className="truncate">Discussion</span>
            {discussionCount > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center h-5 min-w-5 rounded-full text-xs leading-none shrink-0 px-1",
                  discussionRead ? "bg-muted" : "bg-red-500 text-white"
                )}
              >
                {discussionCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  )
}
