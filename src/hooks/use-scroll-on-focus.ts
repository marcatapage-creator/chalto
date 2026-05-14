import type { FocusEvent } from "react"

export function scrollOnFocus(e: FocusEvent<HTMLElement>) {
  const el = e.currentTarget
  setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300)
}
