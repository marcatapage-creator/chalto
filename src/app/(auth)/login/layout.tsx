import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Chalto Pro.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
