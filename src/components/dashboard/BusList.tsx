
"use client";

import React from "react";
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
import type { Bus } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";
import { ScrollArea } from "../ui/scroll-area";


interface BusListProps {
    buses: Bus[];
}

export function BusList({ buses }: BusListProps) {
  const { t } = useLanguage();

  const getStatusVariant = (status: Bus['status']) => {
    if (status === 'Active') return 'bg-green-500 hover:bg-green-500/80';
    if (status === 'Delayed') return 'bg-red-500 hover:bg-red-500/80';
    if (status === 'Inactive') return 'bg-gray-500 hover:bg-gray-500/80';
    return 'bg-primary';
  }

  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
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
                    {buses.length > 0 ? buses.map((bus) => (
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
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No buses match the current filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
