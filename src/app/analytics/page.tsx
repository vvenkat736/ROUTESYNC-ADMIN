"use client";

import * as React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { BusStatusChart } from "@/components/dashboard/BusStatusChart";
import { TripsChart } from "@/components/dashboard/TripsChart";
import { DelaysChart } from "@/components/dashboard/DelaysChart";
import { CarbonFootprintChart } from "@/components/dashboard/CarbonFootprintChart";
import { FleetOverview } from "@/components/dashboard/FleetOverview";

export default function AnalyticsPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="icon">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="p-4 lg:p-6 space-y-6 bg-background">
            <FleetOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BusStatusChart />
                <TripsChart />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <DelaysChart />
              <CarbonFootprintChart />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
