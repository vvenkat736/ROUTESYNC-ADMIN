
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AnalyticsPage() {
  const { organization } = useAuth();
  const [driverCount, setDriverCount] = React.useState(0);

  React.useEffect(() => {
    if (!organization) {
      setDriverCount(0);
      return;
    }
    const driversQuery = query(collection(db, "drivers"), where("city", "==", organization));
    getCountFromServer(driversQuery).then((snapshot) => {
        setDriverCount(snapshot.data().count);
    });
  }, [organization]);

  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="offcanvas">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="p-4 lg:p-6 space-y-6 bg-background">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <BusStatusChart />
                <TripsChart />
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{driverCount}</div>
                    </CardContent>
                </Card>
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
