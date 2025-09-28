
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
import { useLanguage } from '@/hooks/use-language';
import { Bot, Loader, Save, AlertTriangle } from 'lucide-react';
import { generateRoutes } from '@/ai/flows/route-generator-flow';
import type { GenerateRoutesOutput } from '@/ai/flows/route-generator-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dynamic from 'next/dynamic';
import type { Stop } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';


const OptimizerMap = dynamic(() => import('@/components/dashboard/OptimizerMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full" />,
});


export default function RouteGeneratorPage() {
  const { t } = useLanguage();
  const { organization } = useAuth();
  const [generatedRoutes, setGeneratedRoutes] = React.useState<GenerateRoutesOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [stops, setStops] = React.useState<Stop[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
    if (!organization) return;
    const q = query(collection(db, "stops"), where("city", "==", organization));
    getDocs(q).then((querySnapshot) => {
      const stopsData: Stop[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stopsData.push({
          stop_id: doc.id,
          ...data,
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
        } as Stop);
      });
      setStops(stopsData);
    });
  }, [organization]);

  const handleGenerateRoutes = async () => {
    if (!organization) return;
    setIsLoading(true);
    setGeneratedRoutes(null);
    try {
      const result = await generateRoutes(organization);
      setGeneratedRoutes(result);
    } catch (error) {
      console.error('Error generating routes:', error);
      const errorMessage = (error as Error).message || "The AI failed to generate routes. Please try again.";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoutes = async () => {
    if (!generatedRoutes || !organization) return;
    setIsSaving(true);
    try {
        const batch = writeBatch(db);
        const routesCollection = collection(db, 'routes');

        generatedRoutes.routes.forEach((route) => {
            const docRef = doc(routesCollection); // Let Firestore auto-generate the document ID
            batch.set(docRef, {
                ...route,
                city: organization, // Tag the route with the current city
            });
        });

        await batch.commit();
        toast({
            title: t('routes_saved_success'),
        });
        setGeneratedRoutes(null);
    } catch (error) {
        console.error("Error saving routes:", error);
        toast({
            title: t('routes_saved_error'),
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const hasStops = stops.length > 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="offcanvas">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="p-4 lg:p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot />
                  {t('route_generator')}
                </CardTitle>
                <CardDescription>{t('route_generator_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {hasStops ? (
                    <Button onClick={handleGenerateRoutes} disabled={isLoading || !hasStops}>
                        {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        {t('generate_routes')}
                    </Button>
                ) : (
                    <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                            <div>
                                <CardTitle className="text-amber-700 dark:text-amber-400">{t('no_stops_found')}</CardTitle>
                                <CardDescription className="text-amber-600 darktext-amber-500">{t('no_stops_desc')}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                )}
              </CardContent>
            </Card>

            {isLoading && (
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('generating_routes_desc')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </CardContent>
                 </Card>
            )}

            {generatedRoutes && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{t('generated_routes')}</CardTitle>
                        <CardDescription>Review the routes generated by the algorithm and save them to your database.</CardDescription>
                    </div>
                    <Button onClick={handleSaveRoutes} disabled={isSaving}>
                        {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        {t('save_routes')}
                    </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-[500px]">
                    {isClient && <OptimizerMap routes={generatedRoutes} />}
                  </div>
                  <div className="max-h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('route_name')}</TableHead>
                          <TableHead>{t('stops')}</TableHead>
                          <TableHead>{t('total_distance_km')}</TableHead>
                          <TableHead>{t('total_time_min')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedRoutes.routes.map((route, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{route.routeName}</TableCell>
                            <TableCell>{route.stops.length}</TableCell>
                            <TableCell>{route.totalDistance.toFixed(2)}</TableCell>
                            <TableCell>{route.totalTime}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
