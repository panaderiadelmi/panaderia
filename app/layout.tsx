import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart/CartProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display-next',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body-next',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  title: {
    default:  'Señas Gómez — Panadería · Bollería · Horno de Leña',
    template: '%s | Señas Gómez',
  },
  description:
    'Panadería artesanal con horno de leña. Pan candeal, baguettes y bollería elaborados a diario con masa madre y harinas seleccionadas. Haz tu pedido online.',
  keywords: ['panadería artesanal', 'horno de leña', 'pan candeal', 'bollería', 'masa madre', 'Señas Gómez'],
  openGraph: {
    type:   'website',
    locale: 'es_ES',
    siteName: 'Señas Gómez',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');document.documentElement.dataset.theme=t;}())` }} />
      </head>
      <body><CartProvider>{children}</CartProvider></body>
    </html>
  );
}
