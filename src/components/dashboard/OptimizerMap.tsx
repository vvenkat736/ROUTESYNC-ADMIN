
'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useMemo } from 'react';
import { GenerateRoutesOutput } from '@/ai/flows/route-generator-flow';

const createStopIcon = () => {
    return L.divIcon({
      html: `<div style="font-size: 20px;">📍</div>`,
      className: 'bg-transparent border-0',
      iconSize: [20, 20],
      iconAnchor: [10, 20],
    });
};

const routeColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];


interface OptimizerMapProps {
  routes: GenerateRoutesOutput | null;
}

export default function OptimizerMap({ routes }: OptimizerMapProps) {
  const defaultCenter: [number, number] = [10.80, 78.69];

  const allStops = useMemo(() => {
    if (!routes) return [];
    const stopMap = new Map<string, { lat: number, lng: number }>();
    routes.routes.forEach(route => {
        route.path.forEach(point => {
            // A simple way to get unique stops for markers
            const key = `${point.lat},${point.lng}`;
            if(!stopMap.has(key)) {
                stopMap.set(key, point);
            }
        })
    });
    return Array.from(stopMap.values());
  }, [routes]);

  const mapCenter = useMemo(() => {
    if (allStops.length > 0) {
      const avgLat = allStops.reduce((sum, p) => sum + p.lat, 0) / allStops.length;
      const avgLng = allStops.reduce((sum, p) => sum + p.lng, 0) / allStops.length;
      return [avgLat, avgLng] as [number, number];
    }
    return defaultCenter;
  }, [allStops, defaultCenter]);

  const mapZoom = useMemo(() => {
      return routes ? 12: 10;
  }, [routes]);

  return (
    <MapContainer
      key={`${mapCenter.join(',')}-${mapZoom}`}
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      className="h-full w-full z-0 rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routes?.routes.map((route, index) => (
          <Polyline 
            key={route.route_id} 
            positions={route.path.map(p => [p.lat, p.lng])} 
            color={routeColors[index % routeColors.length]}
          >
            <Popup>{route.routeName}</Popup>
          </Polyline>
      ))}
      {allStops.map((stop, index) => (
         <Marker
            key={index}
            position={[stop.lat, stop.lng]}
            icon={createStopIcon()}
        />
      ))}
    </MapContainer>
  );
}
