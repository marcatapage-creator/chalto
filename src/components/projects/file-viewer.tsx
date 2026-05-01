"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Maximize2, Download, X, Trash2, FileText, ExternalLink, FileDown } from "lucide-react"

interface FileViewerProps {
  fileUrl: string
  fileName: string
  fileType: string
  onRemove?: () => void
}

export function FileViewer({ fileUrl, fileName, fileType, onRemove }: FileViewerProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const [isAndroid] = useState(
    () => typeof window !== "undefined" && /Android/i.test(navigator.userAgent)
  )

  const isPdf = fileType === "application/pdf"
  const isImage = fileType.startsWith("image/")

  const inner = (
    <div className="relative w-full h-full min-h-100 bg-muted/30 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-sm border-b">
        <p className="text-xs font-medium truncate max-w-50">{fileName}</p>
        <div className="flex items-center gap-1">
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
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
        {isPdf &&
          (isAndroid ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{fileName}</p>
              <Button onClick={() => window.open(fileUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir le PDF
              </Button>
            </div>
          ) : (
            <iframe
              src={`${fileUrl}#toolbar=0`}
              className="w-full h-full min-h-100"
              title={fileName}
            />
          ))}
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
        {!isPdf && !isImage && (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
            <FileDown className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{fileName}</p>
            <Button onClick={() => window.open(fileUrl, "_blank")}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
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
