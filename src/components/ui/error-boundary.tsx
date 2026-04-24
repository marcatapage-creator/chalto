"use client"

import { Component, type ReactNode } from "react"
import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    Sentry.captureException(error)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div className="space-y-1">
            <p className="font-semibold">Une erreur inattendue est survenue</p>
            <p className="text-sm text-muted-foreground">
              L&apos;équipe a été notifiée automatiquement.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={this.reset}>
            Réessayer
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
