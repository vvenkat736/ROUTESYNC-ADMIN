"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { carbonFootprintData } from '@/lib/data';
import { useLanguage } from '@/hooks/use-language';

export function CarbonFootprintChart() {
  const { t } = useLanguage();
  
  const translatedData = carbonFootprintData.map(item => ({
    ...item,
    name: t(item.name.toLowerCase() as any)
  }));

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>{t('carbon_footprint')}</CardTitle>
        <CardDescription>{t('carbon_footprint_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={translatedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="fleet" name={t('fleet_emissions')} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cars" name={t('car_emissions')} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
