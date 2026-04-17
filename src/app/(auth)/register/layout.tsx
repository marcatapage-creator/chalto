import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Chalto gratuitement. Sans carte bancaire.",
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
