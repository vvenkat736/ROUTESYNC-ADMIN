
"use client";

import * as React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { Toaster } from '@/components/ui/toaster';
import LoadingScreen from '@/components/dashboard/LoadingScreen';

// export const metadata: Metadata = {
//   title: 'RouteSync ADMIN',
//   description: 'Real-time Bus Fleet Management Dashboard',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000); 
    return () => clearTimeout(timer);
  }, []);


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>RouteSync ADMIN</title>
        <meta name="description" content="Real-time Bus Fleet Management Dashboard" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""/>
      </head>
      <body className={cn("font-body antialiased", "min-h-screen bg-background font-sans")}>
        {loading && <LoadingScreen />}
        <div style={{ visibility: loading ? 'hidden' : 'visible' }}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LanguageProvider>
                {children}
                <Toaster />
            </LanguageProvider>
            </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
