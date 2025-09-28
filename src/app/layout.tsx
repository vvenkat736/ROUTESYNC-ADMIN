
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
  const [initialLoading, setInitialLoading] = React.useState(true);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    // This timer is for the initial splash screen aesthetic
    const timer = setTimeout(() => setInitialLoading(false), 4000); 
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    // This effect handles redirection based on auth state
    if (!isAuthLoading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, pathname, router]);

  // Show a loading screen if auth is still loading, OR if it's the initial splash screen time,
  // but do not show the splash screen for the login page itself.
  if (isAuthLoading || (initialLoading && pathname !== '/login')) {
      // If we are on the login path, and auth is done, we can show the login page.
      // Otherwise, we might be in a redirect state or initial load.
      if (pathname === '/login' && !isAuthLoading) {
         return <div className="min-h-screen bg-background">{children}</div>;
      }
      return <LoadingScreen />;
  }

  // After all loading, if we're not authenticated and not on the login page,
  // we might still be in the process of redirecting. A blank screen is better than a flash of content.
  if (!isAuthenticated && pathname !== '/login') {
      return null;
  }

  return (
    <div style={{ visibility: initialLoading && pathname !== '/login' ? 'hidden' : 'visible' }}>
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
