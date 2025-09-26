"use client"

import { DonutChart } from "@tremor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { busStatusData } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";

export function BusStatusChart() {
  const { t } = useLanguage();

  const translatedData = busStatusData.map(item => ({
    ...item,
    name: t(item.name.toLowerCase() as any)
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('bus_status_distribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60">
           <DonutChart
            data={translatedData}
            category="value"
            index="name"
            colors={["emerald", "amber", "slate"]}
            className="h-full"
            />
        </div>
      </CardContent>
    </Card>
  );
}
