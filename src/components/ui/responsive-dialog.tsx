"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  contentClassName?: string
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  children,
  contentClassName,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          className={cn("flex flex-col max-h-[90dvh] overflow-hidden p-0 gap-0", contentClassName)}
        >
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-4">{children}</div>
          {footer && (
            <DialogFooter className="shrink-0 mx-0 mb-0 border-t px-6 py-4">{footer}</DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent
        {...(!description && { "aria-describedby": undefined })}
        onOverlayClick={() => onOpenChange(false)}
      >
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {children}
          {footer && (
            <div className="-mx-6 mt-4 border-t bg-muted/50 px-6 py-4 flex flex-col-reverse gap-2">
              {footer}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
