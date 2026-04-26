"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const FILTERS = [
  { label: "Tous", value: "" },
  { label: "En cours", value: "active" },
  { label: "Terminé", value: "completed" },
  { label: "Archivé", value: "archived" },
] as const

interface ProjectsFilterProps {
  counts: Record<string, number>
  total: number
}

export function ProjectsFilter({ counts, total }: ProjectsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("status") ?? ""

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("status", value)
    } else {
      params.delete("status")
    }
    router.push(`/projects?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {FILTERS.map(({ label, value }) => {
        const count = value ? (counts[value] ?? 0) : total
        const isActive = current === value
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              "inline-flex items-center gap-1.5 pl-3 pr-1.75 py-1.5 rounded-full text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {label}
            <span
              className={cn(
                "text-xs h-5 min-w-5 px-1 rounded-full flex items-center justify-center",
                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background"
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
