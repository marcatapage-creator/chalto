"use client"

import { useReducer, useEffect } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Button } from "@/components/ui/button"

type ConsentStatus = "accepted" | "refused"
type ConsentState = ConsentStatus | "pending" | "idle"

const STORAGE_KEY = "cookie-consent"

function reducer(_: ConsentState, action: ConsentState): ConsentState {
  return action
}

export function CookieConsent({ gaId }: { gaId?: string }) {
  const [status, dispatch] = useReducer(reducer, "idle")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentStatus | null
    dispatch(stored === "accepted" || stored === "refused" ? stored : "pending")
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted")
    dispatch("accepted")
  }

  const refuse = () => {
    localStorage.setItem(STORAGE_KEY, "refused")
    dispatch("refused")
  }

  return (
    <>
      {status === "accepted" && gaId && <GoogleAnalytics gaId={gaId} />}

      {status === "pending" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-4 shadow-lg sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Nous utilisons des cookies analytiques (Google Analytics) pour comprendre comment vous
              utilisez Chalto et améliorer le service.{" "}
              <button
                onClick={refuse}
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                En savoir plus
              </button>
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={refuse}>
                Refuser
              </Button>
              <Button size="sm" onClick={accept}>
                Accepter
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
