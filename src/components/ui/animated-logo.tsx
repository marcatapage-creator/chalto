"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface AnimatedLogoProps {
  width?: number
  height?: number
  className?: string
  loop?: boolean
}

export function AnimatedLogo({
  width = 24,
  height = 24,
  className,
  loop = false,
}: AnimatedLogoProps) {
  if (loop) {
    return (
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{ perspective: 800 }}
        className={className}
      >
        <Image src="/Logo.svg" alt="Chalto" width={width} height={height} />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
      transition={{
        rotateY: {
          duration: 0.8,
          ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
        },
        opacity: { duration: 0.4 },
        scale: { duration: 0.6, ease: "easeOut" },
      }}
      style={{ perspective: 800 }}
      className={className}
    >
      <Image src="/Logo.svg" alt="Chalto" width={width} height={height} />
    </motion.div>
  )
}
