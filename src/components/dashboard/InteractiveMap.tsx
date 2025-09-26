"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from "@/components/ui/card";
import { Waypoints } from 'lucide-react';
import { buses as initialBuses } from '@/lib/data';
import { useLanguage } from '@/hooks/use-language';
import type { Bus } from '@/lib/data';

const statusColors: { [key: string]: string } = {
  Active: '#22C55E', // green-500
  Delayed: '#F97316', // orange-500
  Inactive: '#6B7280', // gray-500
};

const createBusIcon = (status: Bus['status']) => {
    const color = statusColors[status] || '#000';
    return L.divIcon({
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; margin-bottom: 2px; border: 1px solid white;"></div>
          <div style="font-size: 24px;">🚍</div>
        </div>
      `,
      className: 'bg-transparent border-0',
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40],
    });
};

export default function InteractiveMap() {
  const { t } = useLanguage();
  const [buses, setBuses] = useState<Bus[]>(initialBuses);
  const position: [number, number] = [11.0168, 76.9558];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(currentBuses => 
        currentBuses.map(bus => {
          if (bus.status === 'Active') {
            const latChange = (Math.random() - 0.5) * 0.001;
            const lngChange = (Math.random() - 0.5) * 0.001;
            return {
              ...bus,
              lat: bus.lat + latChange,
              lng: bus.lng + lngChange,
            };
          }
          return bus;
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-[600px] lg:h-full overflow-hidden">
      <CardContent className="p-0 h-full">
          <div className="h-full w-full relative">
            <div className="absolute top-2 left-2 z-[1000] bg-background/80 p-2 rounded-lg shadow-md flex items-center gap-2">
                <Waypoints className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-primary">{t('live_fleet_map')}</h2>
            </div>
            <MapContainer center={position} zoom={12} scrollWheelZoom={true} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {buses.map((bus) => (
                <Marker
                  key={bus.id}
                  position={[bus.lat, bus.lng]}
                  icon={createBusIcon(bus.status)}
                >
                  <Popup>
                    <div className="p-1 font-sans">
                      <h3 className="font-bold text-lg mb-2">{t('bus')} #{bus.busNumber}</h3>
                      <p><span className="font-semibold">{t('route')}:</span> {bus.route}</p>
                      <p><span className="font-semibold">{t('driver')}:</span> {bus.driver}</p>
                      <p><span className="font-semibold">{t('status')}:</span> 
                        <span style={{ color: statusColors[bus.status] }} className="ml-1 font-bold">
                          {t(bus.status.toLowerCase() as any)}
                        </span>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
      </CardContent>
    </Card>
  );
}
