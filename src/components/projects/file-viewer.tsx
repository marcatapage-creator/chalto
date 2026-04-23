"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Maximize2, Download, X } from "lucide-react"

interface FileViewerProps {
  fileUrl: string
  fileName: string
  fileType: string
}

export function FileViewer({ fileUrl, fileName, fileType }: FileViewerProps) {
  const [fullscreen, setFullscreen] = useState(false)

  const isPdf = fileType === "application/pdf"
  const isImage = fileType.startsWith("image/")

  const inner = (
    <div className="relative w-full h-full min-h-100 bg-muted/30 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-sm border-b">
        <p className="text-xs font-medium truncate max-w-50">{fileName}</p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => window.open(fileUrl, "_blank")}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setFullscreen(!fullscreen)}
          >
            {fullscreen ? <X className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Contenu */}
      <div className="pt-10 h-full">
        {isPdf && (
          <>
            {/* Desktop : iframe inline */}
            <iframe
              src={`${fileUrl}#toolbar=0`}
              className="hidden sm:block w-full h-full min-h-100"
              title={fileName}
            />
            {/* Mobile : iOS Safari ne supporte pas les PDF en iframe */}
            <div className="sm:hidden flex flex-col items-center justify-center gap-4 py-10 px-4 text-center">
              <p className="text-sm text-muted-foreground">Aperçu indisponible sur mobile</p>
              <button
                onClick={() => window.open(fileUrl, "_blank")}
                className="text-sm font-medium text-primary underline underline-offset-2"
              >
                Ouvrir le PDF →
              </button>
            </div>
          </>
        )}
        {isImage && (
          <div className="flex items-center justify-center h-full p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>
        )}
      </div>
    </div>
  )

  if (fullscreen) {
    return <div className="fixed inset-0 z-50 bg-background p-4 flex flex-col">{inner}</div>
  }

  return inner
}
