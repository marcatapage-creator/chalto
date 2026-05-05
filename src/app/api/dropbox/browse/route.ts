import { createClient } from "@/lib/supabase/server"
import { getValidAccessToken, callDropbox } from "@/lib/dropbox"
import { NextResponse, type NextRequest } from "next/server"

interface DropboxEntry {
  ".tag": "file" | "folder"
  name: string
  path_lower: string
  path_display: string
  id: string
  size?: number
  client_modified?: string
}

interface ListFolderResult {
  entries: DropboxEntry[]
  cursor: string
  has_more: boolean
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const path = request.nextUrl.searchParams.get("path") ?? ""

  const accessToken = await getValidAccessToken(user.id)
  if (!accessToken) {
    return NextResponse.json({ error: "Dropbox non connecté" }, { status: 403 })
  }

  try {
    const result = await callDropbox<ListFolderResult>(accessToken, "/files/list_folder", {
      path,
      recursive: false,
      include_non_downloadable_files: false,
    })

    return NextResponse.json({
      entries: result.entries.map((e) => ({
        tag: e[".tag"],
        name: e.name,
        path: e.path_display,
        id: e.id,
        size: e.size,
        modified: e.client_modified,
      })),
    })
  } catch {
    return NextResponse.json({ error: "Erreur Dropbox" }, { status: 502 })
  }
}
