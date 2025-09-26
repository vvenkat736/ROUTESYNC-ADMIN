"use client";

import { Bell, AlertTriangle, Bus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { alerts } from "@/lib/data";

export function AlertsPopover() {
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {alerts.length > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader>
            <CardTitle>{t('alerts_title')}</CardTitle>
            <CardDescription>{t('alerts_description')}</CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(alert.type)}</div>
                    <div>
                      <p className="font-semibold">{t(alert.type.toLowerCase() as any)}: {alert.busNumber}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('no_alerts')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
