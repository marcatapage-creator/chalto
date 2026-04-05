import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Chalto Pro | Trust Engine pour Architectes',
  description: 'Éspace de validation et de suivi projet pour clients exigents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
