"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchDashboardCounts } from "@/app/(dashboard)/dashboard/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, FileText, CheckCircle, Clock, CheckCircle2 } from "lucide-react"
import { StaggerList, StaggerItem } from "@/components/ui/motion"

interface Counts {
  activeProjects: number
  totalDocs: number
  approved: number
  pending: number
}

interface DashboardStatsProps {
  userId: string
  initialCounts: Counts
}

export function DashboardStats({ userId, initialCounts }: DashboardStatsProps) {
  const supabase = useMemo(() => createClient(), [])
  const [counts, setCounts] = useState<Counts>(initialCounts)

  const refreshCounts = useCallback(async () => {
    const updated = await fetchDashboardCounts(userId)
    setCounts(updated)
  }, [userId])

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, refreshCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, refreshCounts)
      .subscribe((_status, err) => {
        if (err) console.error("[dashboard-stats] Realtime error:", err)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshCounts, supabase])

  const allClear = counts.pending === 0

  const stats = [
    {
      label: "Projets actifs",
      value: counts.activeProjects,
      icon: FolderOpen,
      description: "En cours",
      allClear: false,
    },
    {
      label: "Documents",
      value: counts.totalDocs,
      icon: FileText,
      description: "Total",
      allClear: false,
    },
    {
      label: "Validations reçues",
      value: counts.approved,
      icon: CheckCircle,
      description: "Approuvés",
      allClear: false,
    },
    {
      label: "En attente",
      value: counts.pending,
      icon: allClear ? CheckCircle2 : Clock,
      description: allClear ? "Tout est à jour ✓" : "Envoyés",
      allClear,
    },
  ]

  return (
    <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <StaggerItem key={stat.label}>
            <Card className="transition-all duration-150 hover:shadow-sm hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon
                  className={
                    stat.allClear ? "h-4 w-4 text-green-500" : "h-4 w-4 text-muted-foreground"
                  }
                />
              </CardHeader>
              <CardContent>
                <div
                  className={
                    stat.allClear ? "text-2xl font-bold text-green-500" : "text-2xl font-bold"
                  }
                >
                  {stat.value}
                </div>
                <p
                  className={
                    stat.allClear
                      ? "text-xs text-green-600 mt-1 font-medium"
                      : "text-xs text-muted-foreground mt-1"
                  }
                >
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        )
      })}
    </StaggerList>
  )
}
