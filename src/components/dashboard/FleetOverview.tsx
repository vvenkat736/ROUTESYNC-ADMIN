
"use client";

import React, { useState, useEffect } from "react";
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
import { buses as allBuses, routes as allRoutes } from "@/lib/data";
import type { Bus as BusType, Route as RouteType } from "@/lib/data";

export function FleetOverview() {
  const { t } = useLanguage();
  const [buses, setBuses] = useState<BusType[]>(allBuses.map((b, i) => ({ id: `bus_${i}`, ...b })));
  
  // Get unique routes
  const uniqueRoutes = allRoutes.reduce((acc, current) => {
    if (!acc.find((item) => item.route_id === current.route_id)) {
      acc.push(current);
    }
    return acc;
  }, [] as Partial<RouteType>[]);


  const totalBuses = buses.length;
  const activeBuses = buses.filter(b => b.status === "Active").length;
  const delayedBuses = buses.filter(b => b.status === "Delayed").length;
  const inactiveBuses = buses.filter(b => b.status === "Inactive").length;

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('inactive_buses')}</CardTitle>
            <div className="h-4 w-4 rounded-full bg-gray-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveBuses}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('filter_by_bus_or_driver')} className="pl-10" />
        </div>
        <Select>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={t('filter_by_route')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {uniqueRoutes.map(route => (
              <SelectItem key={route.route_id} value={route.route_id!}>{route.route_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={t('filter_by_status')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="delayed">{t('delayed')}</SelectItem>
            <SelectItem value="inactive">{t('inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
