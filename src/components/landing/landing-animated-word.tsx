"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"

const noop = () => () => {}
function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}

export function LandingAnimatedWord({ words, className }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0)
  const isClient = useIsClient()

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [words])

  const baseClass = `inline-block relative ${className ?? "text-primary text-4xl md:text-6xl"}`

  if (!isClient) {
    return <span className={baseClass}>{words[0]}</span>
  }

  return (
    <span className={baseClass}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, filter: "blur(16px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(16px)", transition: { duration: 0.6, ease: "easeIn" } }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="inline-block"
          style={{ willChange: "opacity, filter" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
