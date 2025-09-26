
"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from "@/components/ui/card";
import { Waypoints } from 'lucide-react';
import { buses as initialBuses, routes } from '@/lib/data';
import { useLanguage } from '@/hooks/use-language';
import type { Bus } from '@/lib/data';

const statusColors: { [key: string]: string } = {
  Active: '#22C55E', // green-500
  Delayed: '#F97316', // orange-500
  Inactive: '#6B7280', // gray-500
};

const routeColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

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

interface AnimatedBus extends Bus {
  routePath: [number, number][];
  currentSegment: number;
  segmentProgress: number;
}

export default function InteractiveMap() {
  const { t } = useLanguage();
  const [animatedBuses, setAnimatedBuses] = useState<AnimatedBus[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.80, 78.69]);

  useEffect(() => {
    const busesWithRoutes = initialBuses.map(bus => {
        const routeData = routes.find(r => r.id === bus.route);
        return {
            ...bus,
            routePath: routeData?.path || [],
            currentSegment: 0,
            segmentProgress: 0,
        };
    }).filter(b => b.routePath.length > 0);

    setAnimatedBuses(busesWithRoutes);

    if (busesWithRoutes.length > 0) {
      const avgLat = busesWithRoutes.reduce((sum, bus) => sum + bus.lat, 0) / busesWithRoutes.length;
      const avgLng = busesWithRoutes.reduce((sum, bus) => sum + bus.lng, 0) / busesWithRoutes.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedBuses(currentBuses => 
        currentBuses.map(bus => {
          if (bus.status !== 'Active' || bus.routePath.length < 2) return bus;
          
          let { currentSegment, segmentProgress } = bus;
          const speed = 0.05; // Adjust for faster/slower animation
          segmentProgress += speed;

          const startPoint = bus.routePath[currentSegment];
          const endPoint = bus.routePath[currentSegment + 1];

          if (!startPoint || !endPoint) return bus;

          const newLat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
          const newLng = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress;

          if (segmentProgress >= 1.0) {
            currentSegment = (currentSegment + 1) % (bus.routePath.length - 1);
            segmentProgress = 0;
          }

          return {
            ...bus,
            lat: newLat,
            lng: newLng,
            currentSegment,
            segmentProgress,
          };
        })
      );
    }, 1000); // Update every second

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
            <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {routes.map((route, index) => (
                  <Polyline key={route.id} positions={route.path} color={routeColors[index % routeColors.length]} weight={3} />
              ))}
              {animatedBuses.map((bus) => (
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

