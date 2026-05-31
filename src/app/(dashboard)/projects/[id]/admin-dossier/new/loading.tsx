import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDossierNewLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3 bg-popover">
        <Skeleton className="h-11 w-11 rounded-md shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-14" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t px-4 py-3 bg-popover flex gap-3">
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 flex-1 rounded-lg" />
      </div>
    </div>
  )
}
