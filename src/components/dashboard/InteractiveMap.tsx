"use client";

import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Waypoints } from 'lucide-react';
import { buses } from '@/lib/data';
import { useLanguage } from '@/hooks/use-language';
import type { Bus } from '@/lib/data';

const BusIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} className="w-8 h-8 drop-shadow-lg">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);


const MapPlaceholder = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center h-full bg-muted rounded-lg p-4 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('map_api_key_missing')}</h3>
            <p className="text-muted-foreground">{t('map_api_key_instructions_1')}</p>
            <p className="text-muted-foreground">{t('map_api_key_instructions_2')}</p>
            <code className="mt-2 p-2 bg-background rounded-md text-sm">.env.local.example</code>
        </div>
    );
};


export default function InteractiveMap() {
  const { t } = useLanguage();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const position = { lat: 11.0168, lng: 76.9558 };
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  const statusColors: { [key: string]: string } = {
    Active: '#22C55E', // green-500
    Delayed: '#F97316', // orange-500
    Inactive: '#6B7280', // gray-500
  };

  if (!apiKey) {
    return (
        <Card className="h-[600px] lg:h-full">
            <CardContent className="p-0 h-full">
                <MapPlaceholder />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="h-[600px] lg:h-full overflow-hidden">
      <CardContent className="p-0 h-full">
        <APIProvider apiKey={apiKey}>
          <div className="h-full w-full relative">
            <div className="absolute top-2 left-2 z-10 bg-background/80 p-2 rounded-lg shadow-md flex items-center gap-2">
                <Waypoints className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-primary">{t('live_fleet_map')}</h2>
            </div>
            <Map
              defaultCenter={position}
              defaultZoom={12}
              mapId="routesync-map"
              gestureHandling={'greedy'}
              disableDefaultUI={true}
            >
              {buses.map((bus) => (
                <AdvancedMarker
                  key={bus.id}
                  position={{ lat: bus.lat, lng: bus.lng }}
                  onClick={() => setSelectedBus(bus)}
                >
                  <BusIcon color={statusColors[bus.status]} />
                </AdvancedMarker>
              ))}

              {selectedBus && (
                <InfoWindow position={{ lat: selectedBus.lat, lng: selectedBus.lng }} onCloseClick={() => setSelectedBus(null)}>
                  <div className="p-2 font-sans">
                    <h3 className="font-bold text-lg mb-2">{t('bus')} #{selectedBus.busNumber}</h3>
                    <p><span className="font-semibold">{t('route')}:</span> {selectedBus.route}</p>
                    <p><span className="font-semibold">{t('driver')}:</span> {selectedBus.driver}</p>
                    <p><span className="font-semibold">{t('status')}:</span> 
                      <span style={{ color: statusColors[selectedBus.status] }} className="ml-1 font-bold">
                        {t(selectedBus.status.toLowerCase() as any)}
                      </span>
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </div>
        </APIProvider>
      </CardContent>
    </Card>
  );
}
