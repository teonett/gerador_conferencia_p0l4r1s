import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Checklist Fácil',
  description: 'Crie e execute checklists com evidências fotográficas.',
  manifest: '/manifest.webmanifest',
  themeColor: '#173f35',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
