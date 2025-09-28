
"use client";

import * as React from "react";
import dynamic from 'next/dynamic';
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { FleetOverview } from "@/components/dashboard/FleetOverview";
import { Skeleton } from "@/components/ui/skeleton";
import { BusList } from "@/components/dashboard/BusList";
import { useBusData } from "@/hooks/use-bus-data";
import type { Bus, Route } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const InteractiveMap = dynamic(() => import('@/components/dashboard/InteractiveMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] lg:h-full w-full" />,
});

export default function Home() {
  const [isClient, setIsClient] = React.useState(false);
  const { buses, isLoading } = useBusData();
  const [allRoutes, setAllRoutes] = React.useState<Route[]>([]);
  const { organization } = useAuth();
  
  const [filteredBuses, setFilteredBuses] = React.useState<Bus[]>([]);
  const [filteredRoutes, setFilteredRoutes] = React.useState<Route[]>([]);
  const [searchText, setSearchText] = React.useState("");
  const [selectedRoute, setSelectedRoute] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!organization) {
      setAllRoutes([]);
      return;
    }
    const routesQuery = query(collection(db, "routes"), where("city", "==", organization));
    const routesUnsubscribe = onSnapshot(routesQuery, (querySnapshot) => {
        const routesData: Route[] = [];
        querySnapshot.forEach((doc) => {
            routesData.push({ id: doc.id, ...doc.data() } as Route);
        });
        setAllRoutes(routesData);
    });

    return () => routesUnsubscribe();
  }, [organization]);
  
  React.useEffect(() => {
    // Filter buses based on selections
    const newFilteredBuses = buses.filter(bus => {
        const searchMatch = searchText === "" ||
            bus.busNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            bus.driver.toLowerCase().includes(searchText.toLowerCase());
        
        const routeMatch = selectedRoute === "all" || bus.route === selectedRoute;

        const statusMatch = selectedStatus === "all" || bus.status.toLowerCase() === selectedStatus;

        return searchMatch && routeMatch && statusMatch;
    });
    setFilteredBuses(newFilteredBuses);

    // Now, filter the routes to display on the map
    if (selectedRoute === 'all') {
        // If "All Routes" is selected, show all routes for the city.
        setFilteredRoutes(allRoutes);
    } else {
        // Otherwise, show only the specific route selected.
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
        <div className="flex-1">
          <Header />
          <main className="p-4 lg:p-6 space-y-6 bg-background">
            <FleetOverview 
              searchText={searchText}
              setSearchText={setSearchText}
              selectedRoute={selectedRoute}
              setSelectedRoute={setSelectedRoute}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {isClient ? <InteractiveMap liveBuses={filteredBuses} displayRoutes={filteredRoutes} /> : <Skeleton className="h-[600px] lg:h-full w-full" />}
              </div>
              <div className="lg:col-span-1">
                <BusList buses={filteredBuses} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
