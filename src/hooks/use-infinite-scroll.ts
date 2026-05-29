"use client"

import { useEffect, useRef, useState } from "react"

const PAGE_SIZE = 10

export function useInfiniteScroll(total: number, resetKey?: unknown) {
  const [{ count: visibleCount, key: trackedKey }, setCountState] = useState({
    count: PAGE_SIZE,
    key: resetKey,
  })
  const sentinelRef = useRef<HTMLDivElement>(null)

  if (trackedKey !== resetKey) {
    setCountState({ count: PAGE_SIZE, key: resetKey })
  }

  const hasMore = visibleCount < total

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountState((s) => ({ ...s, count: s.count + PAGE_SIZE }))
        }
      },
      { rootMargin: "0px 0px 120px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore])

  return { visibleCount, sentinelRef, hasMore }
}
