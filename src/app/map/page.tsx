
"use client";

import * as React from "react";
import dynamic from 'next/dynamic';
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { Skeleton } from "@/components/ui/skeleton";
import type { Route } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const InteractiveMap = dynamic(() => import('@/components/dashboard/InteractiveMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function MapPage() {
  const [isClient, setIsClient] = React.useState(false);
  const { organization } = useAuth();
  const [allRoutes, setAllRoutes] = React.useState<Route[]>([]);

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

  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="offcanvas">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="h-[calc(100vh-4rem)] p-0">
            {isClient ? <InteractiveMap displayRoutes={allRoutes} /> : <Skeleton className="h-full w-full" />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
