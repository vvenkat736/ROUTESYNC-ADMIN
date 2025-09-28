
"use client";

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl, LayerGroup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from "@/components/ui/card";
import { Waypoints } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/AuthContext';
import { buses as allBuses, stops as allStops, routes as allRoutes, type Bus, type Stop } from '@/lib/data';
import type { OptimizeRouteOutput } from '@/ai/flows/route-optimizer-flow';

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

const createNumberedIcon = (number: number | string, color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">${number}</div>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};


interface AnimatedBus extends Bus {
  routePath: [number, number][];
  currentSegment: number;
  segmentProgress: number;
}

interface InteractiveMapProps {
    optimizedRoute?: OptimizeRouteOutput | null;
}

export default function InteractiveMap({ optimizedRoute = null }: InteractiveMapProps) {
  const { t } = useLanguage();
  const { organization } = useAuth();

  const cityStops = useMemo(() => {
    return allStops.filter(stop => stop.city === organization);
  }, [organization]);

  const cityBuses = useMemo(() => {
    return allBuses.filter(bus => bus.city === organization);
  }, [organization]);

  const [animatedBuses, setAnimatedBuses] = useState<AnimatedBus[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.80, 78.69]);

  const generatedRoutePaths = useMemo(() => {
    const stopsMap = new Map(cityStops.map(s => [s.stop_name, s]));
    const routePaths: { [key: string]: [number, number][] } = {};
    
    const routesWithStops: { [key: string]: any[] } = {};
    allRoutes.forEach(routeStop => {
        if (!routesWithStops[routeStop.route_id!]) {
            routesWithStops[routeStop.route_id!] = [];
        }
        routesWithStops[routeStop.route_id!].push(routeStop);
    });

    Object.keys(routesWithStops).forEach(routeId => {
        const sortedStops = routesWithStops[routeId].sort((a, b) => a.stop_sequence - b.stop_sequence);
        const path: [number, number][] = [];
        let pathIsValidForCity = true;
        sortedStops.forEach(routeStop => {
            const stop = stopsMap.get(routeStop.stop_name);
            if (stop) {
                path.push([stop.lat, stop.lng]);
            } else {
                pathIsValidForCity = false;
            }
        });

        if(pathIsValidForCity && path.length > 0) {
            routePaths[routeId] = path;
        }
    });

    return routePaths;
  }, [cityStops]);

  useEffect(() => {
    const busesWithRoutes = cityBuses.map(bus => {
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
            id: bus.busNumber, // ensure unique id for key
            lat: initialLat,
            lng: initialLng,
            routePath: routePath,
            currentSegment: currentSegment,
            segmentProgress: segmentProgress,
        };
    }).filter(b => b.routePath.length > 0);

    setAnimatedBuses(busesWithRoutes);

    if (busesWithRoutes.length > 0) {
      const avgLat = busesWithRoutes.reduce((sum, bus) => sum + bus.lat, 0) / busesWithRoutes.length;
      const avgLng = busesWithRoutes.reduce((sum, bus) => sum + bus.lng, 0) / busesWithRoutes.length;
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
  }, [cityBuses, cityStops, generatedRoutePaths]);
  
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

  const optimizedWaypoints = useMemo(() => {
    if (!optimizedRoute) return [];
    return [
      { ...optimizedRoute.start, type: 'start', color: '#10b981' },
      ...optimizedRoute.waypoints.map(wp => ({ ...wp, type: 'waypoint', color: '#3b82f6' })),
      { ...optimizedRoute.end, type: 'end', color: '#ef4444' },
    ];
  }, [optimizedRoute]);

  const optimizedPolyline = useMemo(() => {
    if (!optimizedRoute) return [];
    return [
      [optimizedRoute.start.lat, optimizedRoute.start.lng],
      ...optimizedRoute.waypoints.map(wp => [wp.lat, wp.lng] as [number, number]),
      [optimizedRoute.end.lat, optimizedRoute.end.lng],
    ];
  }, [optimizedRoute]);

  return (
    <Card className="h-[600px] lg:h-full overflow-hidden">
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

                {optimizedPolyline.length > 0 && (
                    <LayersControl.Overlay checked name="Optimized Route">
                        <LayerGroup>
                             {optimizedWaypoints.map((point, index) => (
                                <Marker
                                key={`optimized-${index}`}
                                position={[point.lat, point.lng]}
                                icon={createNumberedIcon(point.type === 'start' ? 'S' : point.type === 'end' ? 'E' : index, point.color)}
                                >
                                <Popup>{point.name}</Popup>
                                </Marker>
                            ))}
                            <Polyline positions={optimizedPolyline} color="#0284c7" weight={5} dashArray="10, 5" />
                        </LayerGroup>
                    </LayersControl.Overlay>
                )}


              </LayersControl>
            </MapContainer>
          </div>
      </CardContent>
    </Card>
  );
}
