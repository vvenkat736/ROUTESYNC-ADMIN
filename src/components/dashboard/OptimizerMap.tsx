'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useMemo } from 'react';
import { OptimizeRouteOutput } from '@/ai/flows/route-optimizer-flow';

const createNumberedIcon = (number: number | string, color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">${number}</div>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface OptimizerMapProps {
  route: OptimizeRouteOutput | null;
}

export default function OptimizerMap({ route }: OptimizerMapProps) {
  const defaultCenter: [number, number] = [10.80, 78.69];

  const waypoints = useMemo(() => {
    if (!route) return [];
    return [
      { ...route.start, type: 'start', color: '#22c55e' },
      ...route.waypoints.map(wp => ({ ...wp, type: 'waypoint', color: '#3b82f6' })),
      { ...route.end, type: 'end', color: '#ef4444' },
    ];
  }, [route]);

  const polyline = useMemo(() => {
    if (!route) return [];
    return [
      [route.start.lat, route.start.lng],
      ...route.waypoints.map(wp => [wp.lat, wp.lng] as [number, number]),
      [route.end.lat, route.end.lng],
    ];
  }, [route]);

  const mapCenter = useMemo(() => {
    if (waypoints.length > 0) {
      const avgLat = waypoints.reduce((sum, p) => sum + p.lat, 0) / waypoints.length;
      const avgLng = waypoints.reduce((sum, p) => sum + p.lng, 0) / waypoints.length;
      return [avgLat, avgLng] as [number, number];
    }
    return defaultCenter;
  }, [waypoints, defaultCenter]);

  const mapZoom = useMemo(() => {
      return route ? 12: 10;
  }, [route]);

  return (
    <MapContainer
      key={`${mapCenter.join(',')}-${mapZoom}`}
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {waypoints.map((point, index) => (
        <Marker
          key={index}
          position={[point.lat, point.lng]}
          icon={createNumberedIcon(point.type === 'start' ? 'S' : point.type === 'end' ? 'E' : index, point.color)}
        >
          <Popup>{point.name}</Popup>
        </Marker>
      ))}
      {polyline.length > 0 && <Polyline positions={polyline} color="blue" />}
    </MapContainer>
  );
}
