
"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { busStatusData as getBusStatusData } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import type { Bus } from "@/lib/data";


export function BusStatusChart() {
  const { t } = useLanguage();
  const [buses, setBuses] = useState<Bus[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'buses'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const busesData: Bus[] = [];
      querySnapshot.forEach((doc) => {
        busesData.push({ id: doc.id, ...doc.data() } as Bus);
      });
      setBuses(busesData);
    });

    return () => unsubscribe();
  }, []);

  const busStatusData = getBusStatusData(buses);

  const translatedData = busStatusData.map(item => ({
    ...item,
    name: t(item.name.toLowerCase() as any)
  }));
  
  const COLORS: { [key: string]: string } = {
    Active: "hsl(var(--chart-1))",
    Delayed: "hsl(var(--chart-2))",
    Inactive: "hsl(var(--muted))",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('bus_status_distribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={translatedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (
                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {translatedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[busStatusData[index].name]} />
                ))}
              </Pie>
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
