
"use client";

import * as React from "react";
import dynamic from 'next/dynamic';
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { FleetOverview } from "@/components/dashboard/FleetOverview";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusData } from "@/hooks/use-bus-data";
import { useRoutes } from "@/hooks/use-routes";
import type { Bus, Route } from "@/lib/data";
import { BusListSidebar } from "@/components/dashboard/BusListSidebar";

const InteractiveMap = dynamic(() => import('@/components/dashboard/InteractiveMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function Home() {
  const [isClient, setIsClient] = React.useState(false);
  const { routes: allRoutes, isLoading: routesLoading } = useRoutes();
  const { buses, isLoading: busesLoading } = useBusData(allRoutes); // Pass routes to the bus data hook
  
  const [filteredBuses, setFilteredBuses] = React.useState<Bus[]>([]);
  const [filteredRoutes, setFilteredRoutes] = React.useState<Route[]>([]);
  const [searchText, setSearchText] = React.useState("");
  const [selectedRoute, setSelectedRoute] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  React.useEffect(() => {
    const newFilteredBuses = buses.filter(bus => {
        const searchMatch = searchText === "" ||
            bus.busNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            bus.driver.toLowerCase().includes(searchText.toLowerCase());
        
        const routeMatch = selectedRoute === "all" || bus.route === selectedRoute;
        const statusMatch = selectedStatus === "all" || bus.status.toLowerCase() === selectedStatus;

        return searchMatch && routeMatch && statusMatch;
    });
    setFilteredBuses(newFilteredBuses);

    if (selectedRoute === 'all') {
        setFilteredRoutes(allRoutes);
    } else {
        const newFilteredRoutes = allRoutes.filter(route => route.route_id === selectedRoute);
        setFilteredRoutes(newFilteredRoutes);
    }
  }, [searchText, selectedRoute, selectedStatus, buses, allRoutes]);


  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="offcanvas">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 lg:p-6 border-b">
                <FleetOverview 
                searchText={searchText}
                setSearchText={setSearchText}
                selectedRoute={selectedRoute}
                setSelectedRoute={setSelectedRoute}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                routes={allRoutes}
                />
            </div>
            <div className="flex-1 relative">
                {isClient ? (
                    <InteractiveMap liveBuses={filteredBuses} displayRoutes={filteredRoutes} />
                ) : (
                    <Skeleton className="h-full w-full" />
                )}
                <BusListSidebar buses={filteredBuses} />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
