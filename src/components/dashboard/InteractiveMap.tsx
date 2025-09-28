
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl, LayerGroup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from "@/components/ui/card";
import { Waypoints, User, Clock, Users, BusFront, Route as RouteIcon, MapPin as StopIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/AuthContext';
import { type Bus, type Stop, type Route as RouteType } from '@/lib/data';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useBusData } from '@/hooks/use-bus-data';

const statusColors: { [key: string]: string } = {
  Active: '#22C55E', // green-500
  Delayed: '#EF4444', // red-500
  Inactive: '#6B7280', // gray-500
};

const createBusIcon = (status: Bus['status']) => {
  const color = statusColors[status] || '#6B7280';
  const busEmoji = '🚍'; 

  return L.divIcon({
    html: `<div style="font-size: 24px; transform: rotate(-45deg);">${busEmoji}</div><div style="position: absolute; top: 18px; left: 18px; width: 8px; height: 8px; background-color: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px rgba(0,0,0,0.2);"></div>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
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

  const routePaths = useMemo(() => {
    const paths: { [key: string]: { lat: number, lng: number }[] } = {};
    cityRoutes.forEach(route => {
        if (route.path && route.route_id) {
            paths[route.route_id] = route.path;
        }
    });
    return paths;
  }, [cityRoutes]);
  
  const mapCenter = useMemo<[number, number]>(() => {
    if (cityBuses.length > 0) {
      const avgLat = cityBuses.reduce((sum, bus) => sum + bus.lat, 0) / cityBuses.length;
      const avgLng = cityBuses.reduce((sum, bus) => sum + bus.lng, 0) / cityBuses.length;
      if (avgLat && avgLng) {
        return [avgLat, avgLng];
      }
    }
    if (cityStops.length > 0) {
        const avgLat = cityStops.reduce((sum, stop) => sum + stop.lat, 0) / cityStops.length;
        const avgLng = cityStops.reduce((sum, stop) => sum + stop.lng, 0) / cityStops.length;
        if (avgLat && avgLng) {
            return [avgLat, avgLng];
        }
    }
    return [10.80, 78.69];
  }, [cityBuses, cityStops]);
  
  
  return (
    <Card className="h-full overflow-hidden border-0 shadow-none rounded-none">
      <CardContent className="p-0 h-full">
          <div className="h-full w-full relative">
            <MapContainer key={mapCenter.join(',')} center={mapCenter} zoom={12} scrollWheelZoom={true} className="h-full w-full z-0">
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
                        <Polyline key={routeId} positions={routePaths[routeId].map(p => [p.lat, p.lng])} color={routeColors[index % routeColors.length]} weight={3} />
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
                          <div className="w-56 p-1 font-sans">
                             <div className="flex items-center mb-2">
                                <BusFront className="w-6 h-6 mr-2 text-primary" />
                                <h3 className="font-bold text-lg">{bus.busNumber}</h3>
                             </div>
                             <div className="space-y-1 text-sm">
                                <p className="flex items-center"><RouteIcon className="w-4 h-4 mr-2 text-muted-foreground" /><span className="font-semibold mr-1">Route:</span> {bus.route}</p>
                                <p className="flex items-center"><User className="w-4 h-4 mr-2 text-muted-foreground" /><span className="font-semibold mr-1">Driver:</span> {bus.driver}</p>
                                <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-muted-foreground" /><span className="font-semibold mr-1">Status:</span> <span style={{color: statusColors[bus.status]}}>{bus.status}</span></p>
                                <p className="flex items-center"><StopIcon className="w-4 h-4 mr-2 text-muted-foreground" /><span className="font-semibold mr-1">Next:</span> {bus.nextStop} ({bus.nextStopETA} min)</p>
                                <p className="flex items-center"><Users className="w-4 h-4 mr-2 text-muted-foreground" /><span className="font-semibold mr-1">Occupancy:</span> {bus.occupancy}</p>
                             </div>
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
    