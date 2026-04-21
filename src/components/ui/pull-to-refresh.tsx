"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const TRIGGER_THRESHOLD = 130
const SHOW_THRESHOLD = 15 // dead zone before indicator appears
const HEADER_HEIGHT = 56
const INDICATOR_SIZE = 36
const SNAP_Y = HEADER_HEIGHT - INDICATOR_SIZE / 2
const TOTAL_TRAVEL = INDICATOR_SIZE + SNAP_Y

// Walk up the DOM: return true if a scrollable ancestor has content scrolled above the top
function hasScrollableParentAbove(target: Element): boolean {
  let el: Element | null = target
  while (el && el !== document.body && el !== document.documentElement) {
    const { overflowY } = window.getComputedStyle(el)
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollTop > 0) return true
    el = el.parentElement
  }
  return false
}

// Vaul mounts the overlay in a portal only when a drawer is open
function isAnyDrawerOpen(): boolean {
  return !!document.querySelector('[data-slot="drawer-overlay"]')
}

export function PullToRefresh() {
  const router = useRouter()
  const [dragY, setDragY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef<number | null>(null)
  const dragYRef = useRef(0)
  const activeRef = useRef(false)

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (activeRef.current) return
      if (window.scrollY > 0) return
      if (isAnyDrawerOpen()) return
      if (hasScrollableParentAbove(e.target as Element)) return
      startYRef.current = e.touches[0].clientY
      activeRef.current = true
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!activeRef.current || startYRef.current === null) return
      const delta = e.touches[0].clientY - startYRef.current
      if (delta > 0) {
        dragYRef.current = delta
        setDragY(delta)
      } else {
        activeRef.current = false
        dragYRef.current = 0
        setDragY(0)
      }
    }

    const onTouchEnd = () => {
      if (!activeRef.current) return
      activeRef.current = false
      const drag = dragYRef.current
      dragYRef.current = 0
      setDragY(0)
      startYRef.current = null
      if (drag >= TRIGGER_THRESHOLD) {
        setRefreshing(true)
        router.refresh()
        setTimeout(() => setRefreshing(false), 1200)
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true })
    document.addEventListener("touchmove", onTouchMove, { passive: true })
    document.addEventListener("touchend", onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener("touchstart", onTouchStart)
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
    }
  }, [router])

  const effectiveDrag = Math.max(0, dragY - SHOW_THRESHOLD)
  const effectiveRange = TRIGGER_THRESHOLD - SHOW_THRESHOLD
  const visualY = Math.min(
    SNAP_Y,
    -INDICATOR_SIZE + (effectiveDrag / effectiveRange) * TOTAL_TRAVEL
  )
  const progress = Math.min(dragY / TRIGGER_THRESHOLD, 1)

  if (dragY < SHOW_THRESHOLD && !refreshing) return null

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
      style={{
        transform: `translateY(${refreshing ? SNAP_Y : visualY}px)`,
        transition: refreshing ? "transform 0.2s ease" : "none",
      }}
    >
      <div className="bg-card border rounded-full h-9 w-9 flex items-center justify-center shadow-md">
        <RefreshCw
          className={cn("h-4 w-4 text-primary", refreshing && "animate-spin")}
          style={!refreshing ? { transform: `rotate(${progress * 360}deg)` } : undefined}
        />
      </div>
    </div>
  )
}
