"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchDashboardCounts } from "@/app/(dashboard)/dashboard/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, FileText, CheckCircle, Clock } from "lucide-react"
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshCounts, supabase])

  const stats = [
    {
      label: "Projets actifs",
      value: counts.activeProjects,
      icon: FolderOpen,
      description: "En cours",
    },
    { label: "Documents", value: counts.totalDocs, icon: FileText, description: "Total" },
    {
      label: "Validations reçues",
      value: counts.approved,
      icon: CheckCircle,
      description: "Approuvés",
    },
    { label: "En attente", value: counts.pending, icon: Clock, description: "Envoyés" },
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
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        )
      })}
    </StaggerList>
  )
}
