
"use client";

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { Toaster } from '@/components/ui/toaster';
import LoadingScreen from '@/components/dashboard/LoadingScreen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function AppContent({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000); 
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, pathname, router]);

  if (isAuthLoading || (loading && pathname !== '/login') || (!isAuthenticated && pathname !== '/login')) {
      if (pathname === '/login') {
         return <div className="min-h-screen bg-background">{children}</div>;
      }
      return <LoadingScreen />;
  }

  return (
    <div style={{ visibility: loading ? 'hidden' : 'visible' }}>
      {children}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <AuthProvider>
              <AppContent>{children}</AppContent>
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
