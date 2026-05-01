import { cn } from "@/lib/utils"
import type { PrevVersion } from "./document-panel-types"

export function DocumentVersionTabs({
  prevVersions,
  localVersion,
  activeVersionTab,
  onVersionChange,
}: {
  prevVersions: PrevVersion[]
  localVersion: number
  activeVersionTab: number | null
  onVersionChange: (version: number | null) => void
}) {
  if (prevVersions.length === 0) return null

  return (
    <div className="flex text-xs border rounded-lg overflow-hidden">
      <button
        onClick={() => onVersionChange(null)}
        className={cn(
          "flex-1 px-3 py-1.5 transition-colors",
          activeVersionTab === null
            ? "bg-background font-medium"
            : "bg-muted/50 text-muted-foreground hover:text-foreground"
        )}
      >
        V{localVersion} · En cours
      </button>
      {prevVersions.map((pv) => (
        <button
          key={pv.version}
          onClick={() => onVersionChange(pv.version)}
          className={cn(
            "flex-1 px-3 py-1.5 transition-colors border-l",
            activeVersionTab === pv.version
              ? "bg-background font-medium"
              : "bg-muted/50 text-muted-foreground hover:text-foreground"
          )}
        >
          V{pv.version}
        </button>
      ))}
    </div>
  )
}
