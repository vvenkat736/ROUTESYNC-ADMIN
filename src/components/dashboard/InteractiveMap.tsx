
"use client";

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl, LayerGroup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from "@/components/ui/card";
import { Waypoints, User, Clock, Users, AlertCircle, BusFront } from 'lucide-react';
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

const occupancyColors: { [key: string]: string } = {
    Empty: 'text-green-500',
    Full: 'text-orange-500',
    Overcrowded: 'text-red-500',
};

const routeColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];

const createBusIcon = (status: Bus['status']) => {
    const color = statusColors[status] || '#000';
    const busEmoji = status === 'Active' ? '🟢' : status === 'Delayed' ? '🔴' : '⚫️';
    return L.divIcon({
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: rotate(270deg);">
          <div style="font-size: 28px; ">🚍</div>
          <div style="position: absolute; top: 12px; left: 13px; font-size: 14px; transform: rotate(-270deg);">${busEmoji}</div>
        </div>
      `,
      className: 'bg-transparent border-0',
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40],
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

interface AnimatedBus extends Bus {
  routePath: [number, number][];
  currentSegment: number;
  segmentProgress: number;
}

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
    
    return () => {
        stopsUnsubscribe();
    };
  }, [organization]);

  const [animatedBuses, setAnimatedBuses] = useState<AnimatedBus[]>([]);
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
    const busesWithRoutes = cityBuses.map(bus => {
        const existingAnimatedBus = animatedBuses.find(ab => ab.id === bus.id);
        const routePath = routePaths[bus.route] || [];

        if (existingAnimatedBus) {
            return { ...existingAnimatedBus, ...bus, routePath };
        }

        const currentSegment = routePath.length > 1 ? Math.floor(Math.random() * (routePath.length - 1)) : 0;
        const segmentProgress = Math.random();
        
        let initialLat = bus.lat;
        let initialLng = bus.lng;

        if (routePath.length > 1 && routePath[currentSegment] && routePath[currentSegment + 1]) {
            const startPoint = routePath[currentSegment];
            const endPoint = routePath[currentSegment + 1];
            initialLat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
            initialLng = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress;
        }

        return {
            ...bus,
            lat: initialLat,
            lng: initialLng,
            routePath: routePath,
            currentSegment: currentSegment,
            segmentProgress: segmentProgress,
        };
    }).filter(b => b.routePath.length > 0);

    setAnimatedBuses(busesWithRoutes);

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
  }, [cityBuses, cityStops, routePaths]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedBuses(currentBuses => 
        currentBuses.map(bus => {
          if (bus.status !== 'Active' || bus.routePath.length < 2) {
              const dbBus = cityBuses.find(b => b.id === bus.id);
              if (dbBus) {
                  return { ...bus, lat: dbBus.lat, lng: dbBus.lng };
              }
              return bus;
          }
          
          let { currentSegment, segmentProgress } = bus;
          const speed = 0.02; // Adjusted for a ~30km/h feel
          segmentProgress += speed;

          if (segmentProgress >= 1.0) {
            segmentProgress = 0;
            currentSegment = (currentSegment + 1) % (bus.routePath.length - 1);
          }

          const startPoint = bus.routePath[currentSegment];
          const endPoint = bus.routePath[currentSegment + 1];

          if (!startPoint || !endPoint) return bus;

          const newLat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
          const newLng = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress;

          return {
            ...bus,
            lat: newLat,
            lng: newLng,
            currentSegment,
            segmentProgress,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [cityBuses]);

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
                    {animatedBuses.map((bus) => (
                      <Marker
                        key={bus.id}
                        position={[bus.lat, bus.lng]}
                        icon={createBusIcon(bus.status)}
                      >
                        <Popup>
                          <div className="w-64 p-1 font-sans">
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-primary">{bus.busNumber}</h3>
                                <div className="text-sm font-semibold rounded-full px-2 py-0.5" style={{backgroundColor: statusColors[bus.status], color: 'white'}}>
                                  {t(bus.status.toLowerCase() as any)}
                                </div>
                             </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <BusFront className="w-4 h-4 text-muted-foreground" />
                                    <span><span className="font-semibold">Route:</span> {bus.route}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span><span className="font-semibold">Driver:</span> {bus.driver}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span><span className="font-semibold">Next Stop:</span> {bus.nextStop} ({bus.nextStopETA})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className={occupancyColors[bus.occupancy]}><span className="font-semibold text-foreground">Occupancy:</span> {bus.occupancy}</span>
                                </div>
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
