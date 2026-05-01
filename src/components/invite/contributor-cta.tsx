import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, FileText, Users, Zap } from "lucide-react"

const features = [
  { icon: FileText, label: "Documents" },
  { icon: Users, label: "Clients" },
  { icon: Zap, label: "Validations" },
]

export function ContributorCTA() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Image src="/Logo.svg" alt="Chalto" width={24} height={24} />
          <span className="font-bold">Chalto</span>
        </div>
        <div>
          <h3 className="font-semibold text-base">
            Et si vous utilisiez Chalto pour vos propres projets ?
          </h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Gérez vos chantiers, partagez vos documents et faites valider vos livrables par vos
            clients — simplement, depuis votre téléphone.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 py-2">
          {features.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
              <div className="bg-primary/10 p-2 rounded-lg">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        <Button className="w-full" asChild>
          <Link href="/#waitlist">
            Créer mon compte gratuitement
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Gratuit · Sans carte bancaire · Prêt en 2 minutes
        </p>
      </CardContent>
    </Card>
  )
}
