
"use client";

import * as React from "react";
import dynamic from 'next/dynamic';
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { FleetOverview } from "@/components/dashboard/FleetOverview";
import { BusStatusChart } from "@/components/dashboard/BusStatusChart";
import { TripsChart } from "@/components/dashboard/TripsChart";
import { DelaysChart } from "@/components/dashboard/DelaysChart";
import { CarbonFootprintChart } from "@/components/dashboard/CarbonFootprintChart";
import { Skeleton } from "@/components/ui/skeleton";
import { BusList } from "@/components/dashboard/BusList";
import { useBusData } from "@/hooks/use-bus-data";
import type { Bus } from "@/lib/data";

const InteractiveMap = dynamic(() => import('@/components/dashboard/InteractiveMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] lg:h-full w-full" />,
});

export default function Home() {
  const [isClient, setIsClient] = React.useState(false);
  const { buses, isLoading } = useBusData();
  const [filteredBuses, setFilteredBuses] = React.useState<Bus[]>([]);
  const [searchText, setSearchText] = React.useState("");
  const [selectedRoute, setSelectedRoute] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  React.useEffect(() => {
    let newFilteredBuses = buses;

    if (searchText) {
      newFilteredBuses = newFilteredBuses.filter(bus =>
        bus.busNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        bus.driver.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedRoute !== "all") {
      newFilteredBuses = newFilteredBuses.filter(bus => bus.route === selectedRoute);
    }

    if (selectedStatus !== "all") {
      newFilteredBuses = newFilteredBuses.filter(bus => bus.status.toLowerCase() === selectedStatus);
    }

    setFilteredBuses(newFilteredBuses);
  }, [searchText, selectedRoute, selectedStatus, buses]);


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
                {isClient ? <InteractiveMap liveBuses={filteredBuses} /> : <Skeleton className="h-[600px] lg:h-full w-full" />}
              </div>
              <div className="lg:col-span-1">
                <BusList buses={filteredBuses} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <BusStatusChart />
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
