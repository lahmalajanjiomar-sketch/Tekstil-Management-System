
import './globals.css';
import { AppBody } from '@/components/app-body';
import React from 'react';
import { I18nProvider } from '@/context/i18n-context';

// RootLayout MUST be a server component that returns <html> and <body>
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <title>Khsayem Tekstil</title>
        <meta name="description" content="Entegre Sipariş, Stok ve Depo Yönetim Uygulaması" />
      </head>
      <body>
        <I18nProvider>
          <AppBody>
            {children}
          </AppBody>
        </I18nProvider>
      </body>
    </html>
  );
}
