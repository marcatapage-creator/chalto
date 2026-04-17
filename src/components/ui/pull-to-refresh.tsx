"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const THRESHOLD = 80

export function PullToRefresh() {
  const router = useRouter()
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef<number | null>(null)
  const pullYRef = useRef(0)
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
        pullYRef.current = Math.min(delta, THRESHOLD)
        setPullY(pullYRef.current)
      } else {
        activeRef.current = false
        pullYRef.current = 0
        setPullY(0)
      }
    }

    const onTouchEnd = () => {
      if (!activeRef.current) return
      activeRef.current = false
      const snap = pullYRef.current
      pullYRef.current = 0
      setPullY(0)
      startYRef.current = null
      if (snap >= THRESHOLD) {
        setRefreshing(true)
        router.refresh()
        setTimeout(() => setRefreshing(false), 1000)
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

  const progress = Math.min(pullY / THRESHOLD, 1)

  if (pullY === 0 && !refreshing) return null

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
      style={{
        transform: `translateY(${refreshing ? 56 : pullY * 0.5}px)`,
        transition: refreshing ? "transform 0.15s ease" : "none",
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
