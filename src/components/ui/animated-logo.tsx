"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface AnimatedLogoProps {
  width?: number
  height?: number
  className?: string
  loop?: boolean
  noEntrance?: boolean
}

export function AnimatedLogo({
  width = 24,
  height = 24,
  className,
  loop = false,
  noEntrance = false,
}: AnimatedLogoProps) {
  if (noEntrance) {
    return (
      <div className={className}>
        <Image src="/Logo.svg" alt="Chalto" width={width} height={height} />
      </div>
    )
  }

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
      initial={{ filter: "blur(16px)", opacity: 0 }}
      animate={{ filter: "blur(0px)", opacity: 1 }}
      transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Image src="/Logo.svg" alt="Chalto" width={width} height={height} />
    </motion.div>
  )
}
