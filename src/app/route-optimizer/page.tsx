'use client';

import * as React from 'react';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/Header';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { Bot, Loader, Plus, Trash2 } from 'lucide-react';
import { optimizeRoute, OptimizeRouteOutput } from '@/ai/flows/route-optimizer-flow';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const OptimizerMap = dynamic(() => import('@/components/dashboard/OptimizerMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function RouteOptimizerPage() {
  const { t } = useLanguage();
  const [startPoint, setStartPoint] = React.useState('');
  const [destinations, setDestinations] = React.useState(['']);
  const [optimizedRoute, setOptimizedRoute] = React.useState<OptimizeRouteOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddDestination = () => {
    setDestinations([...destinations, '']);
  };

  const handleRemoveDestination = (index: number) => {
    const newDestinations = [...destinations];
    newDestinations.splice(index, 1);
    setDestinations(newDestinations);
  };

  const handleDestinationChange = (index: number, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
  };

  const handleOptimizeRoute = async () => {
    setIsLoading(true);
    setOptimizedRoute(null);
    try {
      const result = await optimizeRoute({
        start: startPoint,
        stops: destinations.filter((d) => d.trim() !== ''),
      });
      setOptimizedRoute(result);
    } catch (error) {
      console.error('Error optimizing route:', error);
      // You can add user-facing error handling here, e.g., using a toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="offcanvas">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="grid flex-1 grid-cols-1 lg:grid-cols-3">
            <div className="p-4 lg:p-6 space-y-6 bg-background col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot />
                    {t('route_optimizer')}
                  </CardTitle>
                  <CardDescription>{t('route_optimizer_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-point">{t('start_point')}</Label>
                    <Input
                      id="start-point"
                      placeholder="e.g., Central Bus Stand, Trichy"
                      value={startPoint}
                      onChange={(e) => setStartPoint(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('destinations')}</Label>
                    {destinations.map((dest, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`e.g., Rockfort Temple, Trichy`}
                          value={dest}
                          onChange={(e) =>
                            handleDestinationChange(index, e.target.value)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDestination(index)}
                          disabled={destinations.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddDestination}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('add_destination')}
                  </Button>
                  <Button
                    onClick={handleOptimizeRoute}
                    disabled={
                      isLoading ||
                      !startPoint ||
                      destinations.every((d) => d.trim() === '')
                    }
                    className="w-full"
                  >
                    {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {t('optimize_route')}
                  </Button>
                </CardContent>
              </Card>
              {optimizedRoute && (
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('optimized_route')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>{optimizedRoute.start.name} (Start)</li>
                            {optimizedRoute.waypoints.map((point, index) => (
                                <li key={index}>{point.name}</li>
                            ))}
                            <li>{optimizedRoute.end.name} (End)</li>
                        </ol>
                        <p className="mt-4 font-semibold">{t('eta')}: {optimizedRoute.totalTime} minutes</p>
                    </CardContent>
                 </Card>
              )}
            </div>
            <div className="lg:col-span-2 h-[50vh] lg:h-auto">
              {isClient && <OptimizerMap route={optimizedRoute} />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
