"use client"

import { useState } from "react"
import { CheckCircle, XCircle, MessageSquare, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import type { ValidationData } from "./document-panel-types"

export function ValidationResultBanner({
  validation,
  localStatus,
}: {
  validation: ValidationData | null
  localStatus: string
}) {
  const [open, setOpen] = useState(false)

  if (!validation || localStatus === "sent" || localStatus === "draft") return null

  const isApproved = validation.status === "approved"
  const isCommented = validation.status === "commented"

  const label = isCommented
    ? `Commenté par ${validation.client_name ?? (validation.contributor_id ? "le prestataire" : "le client")}`
    : isApproved
      ? `Approuvé par ${validation.client_name ?? "le client"}`
      : `Refusé par ${validation.client_name ?? "le client"}`

  const iconCls = isCommented ? "text-blue-500" : isApproved ? "text-primary" : "text-destructive"
  const bgCls = isCommented
    ? "bg-blue-50 dark:bg-blue-900/20"
    : isApproved
      ? "bg-primary/10"
      : "bg-destructive/10"
  const Icon = isCommented ? MessageSquare : isApproved ? CheckCircle : XCircle

  const hasDetails = !!(validation.comment || validation.approved_at)

  return (
    <div className="px-4 py-3 border-b shrink-0">
      <div className={cn("rounded-lg", bgCls)}>
        <button
          onClick={() => hasDetails && setOpen((v) => !v)}
          className={cn(
            "flex items-center gap-3 w-full p-3",
            hasDetails ? "cursor-pointer" : "cursor-default"
          )}
        >
          <Icon className={cn("h-4 w-4 shrink-0", iconCls)} />
          <span className="text-sm font-medium text-left flex-1">{label}</span>
          {hasDetails && (
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                !open && "-rotate-90"
              )}
            />
          )}
        </button>

        <AnimatePresence initial={false}>
          {open && hasDetails && (
            <motion.div
              key="banner-detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-1 pt-0">
                {validation.comment && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground italic">{`"${validation.comment}"`}</p>
                  </div>
                )}
                {validation.approved_at && (
                  <p className="text-xs text-muted-foreground pl-5">
                    {new Date(validation.approved_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
