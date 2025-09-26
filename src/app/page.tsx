"use client";

import * as React from "react";
import dynamic from 'next/dynamic';
import { SidebarProvider, Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { FleetOverview } from "@/components/dashboard/FleetOverview";
import { BusStatusChart } from "@/components/dashboard/BusStatusChart";
import { TripsChart } from "@/components/dashboard/TripsChart";
import { DelaysChart } from "@/components/dashboard/DelaysChart";
import { CarbonFootprintChart } from "@/components/dashboard/CarbonFootprintChart";
import { RouteManagement } from "@/components/dashboard/RouteManagement";
import LoadingScreen from "@/components/dashboard/LoadingScreen";
import { Skeleton } from "@/components/ui/skeleton";

const InteractiveMap = dynamic(() => import('@/components/dashboard/InteractiveMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] lg:h-full w-full" />,
});

export default function Home() {
  const [loading, setLoading] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000); // Simulate loading time for the splash screen
    
    setIsClient(true);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="offcanvas">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="p-4 lg:p-6 space-y-6 bg-background">
            <FleetOverview />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {isClient && <InteractiveMap />}
              </div>
              <div className="space-y-6">
                <RouteManagement />
                <BusStatusChart />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TripsChart />
              <DelaysChart />
              <CarbonFootprintChart />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
