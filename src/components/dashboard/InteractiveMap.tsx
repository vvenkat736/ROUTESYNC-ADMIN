"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from "@/components/ui/card";
import { Waypoints } from 'lucide-react';
import { buses as initialBuses } from '@/lib/data';
import { useLanguage } from '@/hooks/use-language';
import type { Bus } from '@/lib/data';

const createBusIcon = (color: string) => {
    return L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="w-8 h-8 drop-shadow-lg">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>`,
      className: 'bg-transparent border-0',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
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

  const statusColors: { [key: string]: string } = {
    Active: '#22C55E', // green-500
    Delayed: '#F97316', // orange-500
    Inactive: '#6B7280', // gray-500
  };

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
                  icon={createBusIcon(statusColors[bus.status])}
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
