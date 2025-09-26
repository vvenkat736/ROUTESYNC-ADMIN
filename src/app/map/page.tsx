"use client";

import * as React from "react";
import dynamic from 'next/dynamic';
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { Skeleton } from "@/components/ui/skeleton";

const InteractiveMap = dynamic(() => import('@/components/dashboard/InteractiveMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function MapPage() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="icon">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="h-[calc(100vh-4rem)] p-0">
            {isClient && <InteractiveMap />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
