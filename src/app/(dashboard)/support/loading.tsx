import { Skeleton } from "@/components/ui/skeleton"

export default function SupportLoading() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Contact card */}
        <Skeleton className="h-24 w-full rounded-xl" />

        {/* FAQ card */}
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  )
}
