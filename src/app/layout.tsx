import type { Metadata } from 'next';
import { Manrope, Great_Vibes } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/components/providers/AuthProvider';
import ChatWidget from '@/components/layout/ChatWidget';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-signature',
});

export const metadata: Metadata = {
  title: {
    default: 'Atelier Art Royal - Haute Couture Maçonnique',
    template: '%s | Atelier Art Royal',
  },
  description:
    "Découvrez l'excellence de la haute couture maçonnique française. Tabliers, sautoirs, bijoux et décors sur mesure pour tous les rites (REAA, RER, GLDF). Fabrication artisanale, qualité supérieure.",
  keywords: [
    'tablier maçonnique',
    'sautoir maçonnique',
    'bijoux maçonniques',
    'décors maçonniques',
    'REAA',
    'RER',
    'GLDF',
    'franc-maçonnerie',
    'haute couture maçonnique',
    'artisanat français',
  ],
  authors: [{ name: 'Atelier Art Royal' }],
  creator: 'Atelier Art Royal',
  publisher: 'Atelier Art Royal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://artroyal.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Atelier Art Royal - Haute Couture Maçonnique',
    description:
      "L'excellence de la haute couture maçonnique française. Tabliers, sautoirs, bijoux sur mesure.",
    url: 'https://artroyal.fr',
    siteName: 'Atelier Art Royal',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atelier Art Royal - Haute Couture Maçonnique',
    description:
      "L'excellence de la haute couture maçonnique française.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`dark ${manrope.variable} ${greatVibes.variable}`}>
      <body className="min-h-screen bg-background-dark font-sans antialiased selection:bg-primary selection:text-white">
        <AuthProvider>
          {children}
          <ChatWidget />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
