
"use client";

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl, LayerGroup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from "@/components/ui/card";
import { Waypoints } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { Bus, Stop } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';

const statusColors: { [key: string]: string } = {
  Active: '#22C55E', // green-500
  Delayed: '#F97316', // orange-500
  Inactive: '#6B7280', // gray-500
};

const routeColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];

const createBusIcon = (status: Bus['status']) => {
    const color = statusColors[status] || '#000';
    const busEmoji = status === 'Inactive' ? '⚫' : '🚍';
    return L.divIcon({
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; margin-bottom: 2px; border: 1px solid white;"></div>
          <div style="font-size: 24px;">${busEmoji}</div>
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

export default function InteractiveMap() {
  const { t } = useLanguage();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [animatedBuses, setAnimatedBuses] = useState<AnimatedBus[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.80, 78.69]);

  useEffect(() => {
    const qBuses = query(collection(db, 'buses'));
    const unsubscribeBuses = onSnapshot(qBuses, (querySnapshot) => {
      const busesData: Bus[] = [];
      querySnapshot.forEach((doc) => {
        busesData.push({ id: doc.id, ...doc.data() } as Bus);
      });
      setBuses(busesData);
    });

    const qStops = query(collection(db, 'stops'));
    const unsubscribeStops = onSnapshot(qStops, (querySnapshot) => {
        const stopsData: Stop[] = [];
        querySnapshot.forEach((doc) => {
            stopsData.push({ stop_id: doc.id, ...doc.data() } as Stop);
        });
        setStops(stopsData);
    });

    // Routes are not changing in real-time, so we can fetch them once.
    const qRoutes = query(collection(db, 'routes'));
    getDocs(qRoutes).then((querySnapshot) => {
        const routesData: any[] = [];
        querySnapshot.forEach((doc) => {
            routesData.push({ id: doc.id, ...doc.data() });
        });
        setRoutes(routesData);
    });

    return () => {
        unsubscribeBuses();
        unsubscribeStops();
    };
  }, []);

  const generatedRoutePaths = useMemo(() => {
    const stopsMap = new Map(stops.map(s => [s.stop_name, s]));
    const routePaths: { [key: string]: [number, number][] } = {};
    
    const routesWithStops: { [key: string]: any[] } = {};
    routes.forEach(routeStop => {
        if (!routesWithStops[routeStop.route_id]) {
            routesWithStops[routeStop.route_id] = [];
        }
        routesWithStops[routeStop.route_id].push(routeStop);
    });

    Object.keys(routesWithStops).forEach(routeId => {
        const sortedStops = routesWithStops[routeId].sort((a, b) => a.stop_sequence - b.stop_sequence);
        const path: [number, number][] = [];
        sortedStops.forEach(routeStop => {
            const stop = stopsMap.get(routeStop.stop_name);
            if (stop) {
                path.push([stop.lat, stop.lng]);
            }
        });
        routePaths[routeId] = path;
    });

    return routePaths;
  }, [routes, stops]);

  useEffect(() => {
    // Initialize buses with route paths and random progress for a more dynamic start
    const busesWithRoutes = buses.map(bus => {
        const routePath = generatedRoutePaths[bus.route] || [];
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

    if (busesWithRoutes.length > 0 && mapCenter[0] === 10.80) { // Only set initial center
      const avgLat = busesWithRoutes.reduce((sum, bus) => sum + bus.lat, 0) / busesWithRoutes.length;
      const avgLng = busesWithRoutes.reduce((sum, bus) => sum + bus.lng, 0) / busesWithRoutes.length;
      if (avgLat && avgLng) {
        setMapCenter([avgLat, avgLng]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buses, generatedRoutePaths]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedBuses(currentBuses => 
        currentBuses.map(bus => {
          if (bus.status !== 'Active' || bus.routePath.length < 2) return bus;
          
          let { currentSegment, segmentProgress } = bus;
          const speed = 0.05; // Adjust for faster/slower animation
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
                    {Object.keys(generatedRoutePaths).map((routeId, index) => (
                      generatedRoutePaths[routeId] && generatedRoutePaths[routeId].length > 0 &&
                        <Polyline key={routeId} positions={generatedRoutePaths[routeId]} color={routeColors[index % routeColors.length]} weight={3} />
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
                  </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Stops">
                    <LayerGroup>
                        {stops.map(stop => (
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

