
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { useLanguage } from "@/hooks/use-language";
import { Bell, AlertTriangle, Bus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { alerts } from "@/lib/data";

export default function AlertsPage() {
  const { t } = useLanguage();

  const getIcon = (type: string) => {
    switch (type) {
      case "SOS":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "Delayed":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "Inactive":
        return <Bus className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="offcanvas">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="p-4 lg:p-6">
             <div className="flex items-center gap-4 mb-6">
                <Bell className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-semibold">{t('alerts')}</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{t('alerts_history')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                      {alerts.length > 0 ? (
                        alerts.map((alert) => (
                          <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg border">
                            <div className="mt-1">{getIcon(alert.type)}</div>
                            <div>
                              <p className="font-semibold">{t(alert.type.toLowerCase() as any)}: {alert.busNumber}</p>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">{t('no_alerts')}</p>
                      )}
                    </div>
                </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
