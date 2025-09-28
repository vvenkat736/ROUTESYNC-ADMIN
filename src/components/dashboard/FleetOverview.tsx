
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Bus, Users, MapPin, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/contexts/AuthContext";
import { type Route, type Stop } from "@/lib/data";
import { collection, query, where, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useBusData } from "@/hooks/use-bus-data";

interface FleetOverviewProps {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedRoute: string;
  setSelectedRoute: (route: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

export function FleetOverview({
  searchText,
  setSearchText,
  selectedRoute,
  setSelectedRoute,
  selectedStatus,
  setSelectedStatus,
}: FleetOverviewProps) {
  const { t } = useLanguage();
  const { organization } = useAuth();
  const { buses: cityBuses } = useBusData();
  const [cityStops, setCityStops] = useState<Stop[]>([]);
  const [cityRoutes, setCityRoutes] = useState<Route[]>([]);
  const [driverCount, setDriverCount] = useState(0);
  
  useEffect(() => {
    if (!organization) {
      setCityStops([]);
      setCityRoutes([]);
      setDriverCount(0);
      return;
    }

    // Fetch Drivers Count
    const driversQuery = query(collection(db, "drivers"), where("city", "==", organization));
    getCountFromServer(driversQuery).then((snapshot) => {
        setDriverCount(snapshot.data().count);
    });

    const stopsQuery = query(collection(db, "stops"), where("city", "==", organization));
    const stopsUnsubscribe = onSnapshot(stopsQuery, (querySnapshot) => {
      const stopsData: Stop[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stopsData.push({
          stop_id: doc.id,
          ...data,
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
        } as Stop);
      });
      setCityStops(stopsData);
    });

    const routesQuery = query(collection(db, "routes"), where("city", "==", organization));
    const routesUnsubscribe = onSnapshot(routesQuery, (querySnapshot) => {
        const routesData: Route[] = [];
        querySnapshot.forEach((doc) => {
            routesData.push({ id: doc.id, ...doc.data() } as Route);
        });
        setCityRoutes(routesData);
    });

    return () => {
      stopsUnsubscribe();
      routesUnsubscribe();
    };
  }, [organization]);

  const totalBuses = cityBuses.length;
  const activeBuses = cityBuses.filter(b => b.status === "Active").length;
  const delayedBuses = cityBuses.filter(b => b.status === "Delayed").length;

  const uniqueRoutes = useMemo(() => {
      const routeMap = new Map<string, Route>();
      cityRoutes.forEach(route => {
          if(!routeMap.has(route.route_id)) {
              routeMap.set(route.route_id, route);
          }
      });
      return Array.from(routeMap.values());
  }, [cityRoutes]);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_buses')}</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBuses}</div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('drivers')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{driverCount}</div>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('active_buses')}</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBuses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('delayed_buses')}</CardTitle>
            <div className="h-4 w-4 rounded-full bg-orange-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{delayedBuses}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('filter_by_bus_or_driver')} 
            className="pl-10" 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Select value={selectedRoute} onValueChange={setSelectedRoute}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={t('filter_by_route')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routes</SelectItem>
            {uniqueRoutes.map(route => (
              <SelectItem key={route.id} value={route.route_id}>{route.routeName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={t('filter_by_status')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="delayed">{t('delayed')}</SelectItem>
            <SelectItem value="inactive">{t('inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
