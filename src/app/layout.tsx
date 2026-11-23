import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tantri — Authentic Bangladeshi Lungi, Gamcha & Heritage Tees',
  description:
    'Tantri — Woven in Bengal, worn with pride. Shop authentic handloom lungi, gamcha and premium heritage t-shirts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" href="/img/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
