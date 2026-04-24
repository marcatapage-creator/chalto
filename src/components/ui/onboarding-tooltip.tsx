"use client"

// Set to true to re-enable onboarding tooltips when ready
const TOOLTIPS_ENABLED = false

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { FadeIn } from "@/components/ui/motion"

interface OnboardingTooltipProps {
  id: string
  title: string
  description: string
  position?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export function OnboardingTooltip({
  id,
  title,
  description,
  position = "bottom",
  align = "center",
  children,
  disabled = false,
  className,
}: OnboardingTooltipProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const storageKey = `chalto_tooltip_${id}`

  useEffect(() => {
    if (disabled || !TOOLTIPS_ENABLED) return
    const seen = localStorage.getItem(storageKey)
    if (seen) return
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [storageKey, disabled])

  useEffect(() => {
    if (!visible) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handleDismiss()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "true")
    setVisible(false)
  }

  const axisAlign = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  const positionClasses = {
    top: cn("bottom-full mb-2", axisAlign[align]),
    bottom: cn("top-full mt-2", axisAlign[align]),
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  const arrowAlign = {
    start: "left-3",
    center: "left-1/2 -translate-x-1/2",
    end: "right-3",
  }

  const arrowClasses = {
    top: cn(
      "top-full border-t-primary border-l-transparent border-r-transparent border-b-transparent",
      arrowAlign[align]
    ),
    bottom: cn(
      "bottom-full border-b-primary border-l-transparent border-r-transparent border-t-transparent",
      arrowAlign[align]
    ),
    left: "left-full top-1/2 -translate-y-1/2 border-l-primary border-t-transparent border-b-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-primary border-t-transparent border-b-transparent border-l-transparent",
  }

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      {children}

      {visible && (
        <FadeIn className={cn("absolute z-200 w-64", positionClasses[position])}>
          <div className={cn("absolute w-0 h-0 border-4", arrowClasses[position])} />
          <div className="bg-primary text-primary-foreground rounded-xl p-3 shadow-lg space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-tight">💡 {title}</p>
              <button
                onClick={handleDismiss}
                className="text-primary-foreground/70 hover:text-primary-foreground shrink-0 mt-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-primary-foreground/80 leading-relaxed">{description}</p>
            <button
              onClick={handleDismiss}
              className="text-xs font-medium underline underline-offset-2 text-primary-foreground/80 hover:text-primary-foreground"
            >
              OK, j&apos;ai compris
            </button>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
