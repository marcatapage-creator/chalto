import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function SupportLoading() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 max-w-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Contact card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-9 w-40 shrink-0" />
          </CardContent>
        </Card>

        {/* FAQ card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2 mb-6">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b last:border-b-0 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-4" style={{ width: `${55 + (i % 3) * 15}%` }} />
                    <Skeleton className="h-4 w-4 shrink-0 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
