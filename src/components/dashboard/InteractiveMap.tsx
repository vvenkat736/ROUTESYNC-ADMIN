
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl, LayerGroup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from "@/components/ui/card";
import { Waypoints, User, Clock, Users, BusFront } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/AuthContext';
import { type Bus, type Stop, type Route as RouteType } from '@/lib/data';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useBusData } from '@/hooks/use-bus-data';

const statusColors: { [key: string]: string } = {
  Active: '#22C55E', // green-500
  Delayed: '#F97316', // orange-500
  Inactive: '#6B7280', // gray-500
};

const createBusIcon = (status: Bus['status']) => {
    const color = statusColors[status] || '#6B7280';
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 1.5rem; height: 1.5rem; border-radius: 9999px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"></div>`,
      className: 'bg-transparent border-0',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
};

const createStopIcon = () => {
    return L.divIcon({
      html: `<div style="font-size: 20px;">📍</div>`,
      className: 'bg-transparent border-0',
      iconSize: [20, 20],
      iconAnchor: [10, 20],
    });
};

const routeColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];


interface InteractiveMapProps {
    liveBuses?: Bus[];
    displayRoutes?: RouteType[];
}

export default function InteractiveMap({ liveBuses, displayRoutes }: InteractiveMapProps) {
  const { t } = useLanguage();
  const { organization } = useAuth();
  const { buses: allCityBuses } = useBusData();
  const [cityStops, setCityStops] = useState<Stop[]>([]);
  
  const cityBuses = liveBuses ?? allCityBuses;
  const cityRoutes = displayRoutes ?? [];
  
  // Fetch stops in real-time
  useEffect(() => {
    if (!organization) {
      setCityStops([]);
      return;
    }

    const stopsQuery = query(collection(db, "stops"), where("city", "==", organization));
    const stopsUnsubscribe = onSnapshot(stopsQuery, (querySnapshot) => {
      const stopsData: Stop[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stopsData.push({ 
            stop_id: doc.id,
            ...data,
            lat: parseFloat(data.lat as any),
            lng: parseFloat(data.lng as any),
        } as Stop);
      });
      setCityStops(stopsData);
    });
    
    return () => stopsUnsubscribe();
  }, [organization]);

  const [mapCenter, setMapCenter] = useState<[number, number]>([10.80, 78.69]);

  const routePaths = useMemo(() => {
    const paths: { [key: string]: [number, number][] } = {};
    cityRoutes.forEach(route => {
        if (route.path) {
            paths[route.route_id] = route.path.map(p => [p.lat, p.lng]);
        }
    });
    return paths;
  }, [cityRoutes]);

  useEffect(() => {
    if (cityBuses.length > 0) {
      const avgLat = cityBuses.reduce((sum, bus) => sum + bus.lat, 0) / cityBuses.length;
      const avgLng = cityBuses.reduce((sum, bus) => sum + bus.lng, 0) / cityBuses.length;
      if (avgLat && avgLng) {
        setMapCenter([avgLat, avgLng]);
      }
    } else if (cityStops.length > 0) {
        const avgLat = cityStops.reduce((sum, stop) => sum + stop.lat, 0) / cityStops.length;
        const avgLng = cityStops.reduce((sum, stop) => sum + stop.lng, 0) / cityStops.length;
        if (avgLat && avgLng) {
            setMapCenter([avgLat, avgLng]);
        }
    }
  }, [cityBuses, cityStops]);
  
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-0 h-full">
          <div className="h-full w-full relative">
            <div className="absolute top-2 left-2 z-[1000] bg-background/80 p-2 rounded-lg shadow-md flex items-center gap-2">
                <Waypoints className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-primary">{t('live_fleet_map')}</h2>
            </div>
            <MapContainer key={mapCenter.join(',')} center={mapCenter} zoom={12} scrollWheelZoom={true} className="h-full w-full">
               <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Streets">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>
                 <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                        url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Dark">
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                </LayersControl.BaseLayer>
                
                <LayersControl.Overlay checked name="Bus Routes">
                  <LayerGroup>
                    {Object.keys(routePaths).map((routeId, index) => (
                      routePaths[routeId] && routePaths[routeId].length > 0 &&
                        <Polyline key={routeId} positions={routePaths[routeId]} color={routeColors[index % routeColors.length]} weight={3} />
                    ))}
                  </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Buses">
                  <LayerGroup>
                    {cityBuses.map((bus) => (
                      <Marker
                        key={bus.id}
                        position={[bus.lat, bus.lng]}
                        icon={createBusIcon(bus.status)}
                      >
                        <Popup>
                          <div className="w-48 p-1 font-sans">
                             <h3 className="font-bold text-lg">{bus.busNumber}</h3>
                             <p><span className="font-semibold">Route:</span> {bus.route}</p>
                             <p><span className="font-semibold">Driver:</span> {bus.driver}</p>
                             <p><span className="font-semibold">Status:</span> {bus.status}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Stops">
                    <LayerGroup>
                        {cityStops.map(stop => (
                            <Marker
                                key={stop.stop_id}
                                position={[stop.lat, stop.lng]}
                                icon={createStopIcon()}
                            >
                                <Tooltip>
                                    <div className="p-1 font-sans">
                                        <h3 className="font-bold text-base mb-1">{stop.stop_name}</h3>
                                        {stop.note && <p className="text-xs text-muted-foreground">Note: {stop.note}</p>}
                                    </div>
                                </Tooltip>
                            </Marker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>
              </LayersControl>
            </MapContainer>
          </div>
      </CardContent>
    </Card>
  );
}
