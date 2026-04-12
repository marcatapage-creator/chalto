"use client"

import { motion } from "framer-motion"

// Fade simple — pour les pages et cards
export const FadeIn = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Stagger — pour les listes de cards
export const StaggerList = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.07 } },
    }}
    className={className}
  >
    {children}
  </motion.div>
)

export const StaggerItem = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    }}
    className={className}
  >
    {children}
  </motion.div>
)

// Scale — pour les modales et dialogs
export const ScaleIn = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.96 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Slide — pour le drawer mobile
export const SlideIn = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Hover card — pour les cards cliquables
export const HoverCard = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.div>
)

// Hover button — pour les boutons importants
export const HoverButton = ({
  children,
  className,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}) => (
  <motion.div
    whileHover={disabled ? {} : { scale: 1.02 }}
    whileTap={disabled ? {} : { scale: 0.98 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.div>
)

// Hover nav item — pour les liens de navigation
export const HoverNavItem = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <motion.div
    whileHover={{ x: 3 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)
