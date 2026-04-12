"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] gap-1 text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base
        "relative inline-flex h-[calc(100%-6px)] flex-1 items-center justify-center gap-1.5 whitespace-nowrap",
        "rounded-md px-3 py-1.5 text-sm font-medium",
        "border border-transparent",
        "transition-all duration-150 ease-out",
        // Inactive
        "text-muted-foreground",
        // Hover
        "hover:text-foreground hover:bg-background/70 hover:shadow-xs",
        // Active
        "data-[state=active]:bg-neutral-900 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-transparent",
        // Dark mode
        "dark:text-muted-foreground dark:hover:text-foreground",
        "dark:data-[state=active]:bg-white dark:data-[state=active]:text-neutral-900 dark:data-[state=active]:border-transparent",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",
        // Vertical
        "group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start",
        // Icons
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
