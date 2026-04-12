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
    <div className="relative w-full h-full min-h-[400px] bg-muted/30 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-sm border-b">
        <p className="text-xs font-medium truncate max-w-[200px]">{fileName}</p>
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
          <iframe
            src={`${fileUrl}#toolbar=0`}
            className="w-full h-full min-h-[400px]"
            title={fileName}
          />
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
