
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import type { Bus } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";
import { ScrollArea } from "../ui/scroll-area";

export function BusList() {
  const { t } = useLanguage();
  const [buses, setBuses] = useState<Bus[]>([]);

  useEffect(() => {
    const q = query(collection(db, "buses"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const busesData: Bus[] = [];
      snapshot.forEach((doc) => {
        busesData.push({ id: doc.id, ...doc.data() } as Bus);
      });
      setBuses(busesData);
    });
    return () => unsubscribe();
  }, []);

  const getStatusVariant = (status: Bus['status']) => {
    if (status === 'Active') return 'bg-green-500 hover:bg-green-500/80';
    if (status === 'Delayed') return 'bg-orange-500 hover:bg-orange-500/80';
    if (status === 'Inactive') return 'bg-gray-500 hover:bg-gray-500/80';
    return 'bg-primary';
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>{t('active_buses')}</CardTitle>
        <CardDescription>
          Live status of all buses in the fleet.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-full">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                    <TableHead>{t('bus')}</TableHead>
                    <TableHead>{t('driver')}</TableHead>
                    <TableHead>{t('route')}</TableHead>
                    <TableHead className="text-right">{t('status')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {buses.map((bus) => (
                    <TableRow key={bus.id}>
                        <TableCell className="font-medium">{bus.busNumber}</TableCell>
                        <TableCell>{bus.driver}</TableCell>
                        <TableCell>{bus.route}</TableCell>
                        <TableCell className="text-right">
                        <Badge className={getStatusVariant(bus.status)}>
                            {t(bus.status.toLowerCase() as any)}
                        </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
