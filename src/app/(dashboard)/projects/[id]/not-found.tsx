import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FolderX } from "lucide-react"

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="bg-muted p-4 rounded-full">
            <FolderX className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Projet introuvable</h1>
          <p className="text-sm text-muted-foreground">
            Ce projet n&apos;existe pas ou vous n&apos;y avez pas accès.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux projets
          </Link>
        </Button>
      </div>
    </div>
  )
}
