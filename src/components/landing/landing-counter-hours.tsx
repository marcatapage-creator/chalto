"use client"

import { useState, useEffect, useRef } from "react"

// Délais discrets entre chaque chiffre — décélération naturelle vers 6
const TICK_DELAYS = [0, 130, 260, 410, 580, 800]

export function LandingCounterHours() {
  const [current, setCurrent] = useState(1)
  const [animKey, setAnimKey] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true

        TICK_DELAYS.forEach((delay, i) => {
          setTimeout(() => {
            setCurrent(i + 1)
            setAnimKey((k) => k + 1)
          }, delay)
        })
      },
      { rootMargin: "-50px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <span ref={ref} style={{ display: "inline-block", fontVariantNumeric: "tabular-nums" }}>
      <span
        key={animKey}
        style={{
          display: "inline-block",
          animation: "digitIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {current}
      </span>
    </span>
  )
}
