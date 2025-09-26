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
        <path d="M4 18.99h1v.51h14v-.5h1V18c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v.99zM18 6c0-1.1-.9-2-2-2H8C6.9 6 6 6.9 6 8v5h12V8c0-1.1 0-2 0-2zM6.5 14c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S7.33 14 6.5 14zm11 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S18.33 14 17.5 14z"/>
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
