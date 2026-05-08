import { Mail, LifeBuoy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FadeIn } from "@/components/ui/motion"
import { FaqSection } from "@/components/support/faq-section"

export const metadata = { title: "Support" }

const SUPPORT_EMAIL = "marc@chalto.fr"

export default function SupportPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 max-w-2xl space-y-8">
        <div className="flex items-center gap-3">
          <LifeBuoy className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Support</h1>
            <p className="text-muted-foreground text-sm">Nous sommes là pour vous aider</p>
          </div>
        </div>

        {/* Contact */}
        <FadeIn>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold">Une question ? Une difficulté ?</p>
                <p className="text-sm text-muted-foreground">
                  Notre équipe vous répond en moins de 24h, du lundi au vendredi.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </a>
              </Button>
            </CardContent>
          </Card>
        </FadeIn>

        {/* FAQ */}
        <FadeIn>
          <FaqSection />
        </FadeIn>
      </div>
    </div>
  )
}
