"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const START = 1
const END = 6
const TICK_MS = 130

export function LandingCounterHours() {
  const [value, setValue] = useState(START)

  useEffect(() => {
    if (value >= END) return
    const t = setTimeout(() => setValue((v) => v + 1), TICK_MS)
    return () => clearTimeout(t)
  }, [value])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: "0.15em" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "-0.15em" }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        style={{ display: "inline-block", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}
