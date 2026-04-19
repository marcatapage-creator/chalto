"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const TRIGGER_THRESHOLD = 130 // drag distance (px) required to trigger
const HEADER_HEIGHT = 56 // mobile header h-14
const INDICATOR_SIZE = 36 // h-9 w-9
// Straddle header/content boundary: center of indicator sits at header bottom
const SNAP_Y = HEADER_HEIGHT - INDICATOR_SIZE / 2 // 38px
// Total visual travel from hidden (-INDICATOR_SIZE) to snapped (SNAP_Y)
const TOTAL_TRAVEL = INDICATOR_SIZE + SNAP_Y // 74px

export function PullToRefresh() {
  const router = useRouter()
  const [dragY, setDragY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef<number | null>(null)
  const dragYRef = useRef(0)
  const activeRef = useRef(false)

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !activeRef.current) {
        startYRef.current = e.touches[0].clientY
        activeRef.current = true
      }
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

  // Indicator starts hidden above screen (-INDICATOR_SIZE) and slides down
  // with resistance (moves slower than finger) until it reaches SNAP_Y
  const visualY = Math.min(SNAP_Y, -INDICATOR_SIZE + (dragY / TRIGGER_THRESHOLD) * TOTAL_TRAVEL)
  const progress = Math.min(dragY / TRIGGER_THRESHOLD, 1)

  if (dragY === 0 && !refreshing) return null

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
