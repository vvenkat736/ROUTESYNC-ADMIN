
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { useLanguage } from "@/hooks/use-language";
import { FileUp, UploadCloud, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, writeBatch, doc, getFirestore } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Route } from "@/lib/data";

// Simple CSV to JSON parser
const parseCSV = (content: string): any[] => {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  
  const header = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return header.reduce((obj, nextKey, index) => {
      (obj as any)[nextKey] = values[index];
      return obj;
    }, {});
  });
};


export default function RouteManagement() {
  const { t } = useLanguage();
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, "routes"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const routesData: any[] = [];
      querySnapshot.forEach((doc) => {
        routesData.push({ id: doc.id, ...doc.data() });
      });
      setRoutes(routesData);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
        toast({
            title: "No file selected",
            description: "Please select a CSV file to import.",
            variant: "destructive",
        });
        return;
    }

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
            const parsedRoutes = parseCSV(content);
            if (parsedRoutes.length === 0) {
              throw new Error("CSV is empty or invalid.");
            }

            const db = getFirestore();
            const batch = writeBatch(db);
            const routesCollection = collection(db, 'routes');

            parsedRoutes.forEach(route => {
                // Each row in the CSV is a route segment, we create a unique doc for it
                const docRef = doc(routesCollection);
                batch.set(docRef, {
                  route_id: parseInt(route.route_id, 10) || 0,
                  route_name: route.route_name || '',
                  stop_sequence: parseInt(route.stop_sequence, 10) || 0,
                  stop_name: route.stop_name || '',
                  distances_km: parseFloat(route.distances_km) || 0,
                  e_run_time: parseInt(route.e_run_time, 10) || 0,
                  bus_type: route.bus_type || ''
                });
            });

            await batch.commit();

            toast({
                title: "Import Successful",
                description: `${parsedRoutes.length} route segments have been imported.`,
            });
            setDialogOpen(false);
        } catch (error) {
            console.error("Error importing routes:", error);
            toast({
                title: "Import Failed",
                description: "There was an error processing your file. Check console for details.",
                variant: "destructive",
            });
        } finally {
            setIsImporting(false);
            setSelectedFile(null);
        }
    };
    reader.readAsText(selectedFile);
  };

  const groupedRoutes = React.useMemo(() => {
    const byRouteId: { [key: number]: { name: string, type: string, stops: number, distance: number, time: number } } = {};
    routes.forEach(r => {
      if (!byRouteId[r.route_id]) {
        byRouteId[r.route_id] = {
          name: r.route_name,
          type: r.bus_type,
          stops: 0,
          distance: 0,
          time: 0,
        };
      }
      byRouteId[r.route_id].stops++;
      byRouteId[r.route_id].distance += r.distances_km;
      byRouteId[r.route_id].time += r.e_run_time;
    });
    return Object.entries(byRouteId).map(([id, data]) => ({ id, ...data }));
  }, [routes]);

  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="offcanvas">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="p-4 lg:p-6">
            <div className="flex items-center gap-4 mb-6">
              <FileUp className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-semibold">{t('route_import')}</h1>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('route_management')}</CardTitle>
                  <CardDescription>{t('route_management_desc')}</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      {t('import_csv')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{t('import_routes_csv')}</DialogTitle>
                      <DialogDescription>
                        {t('import_routes_csv_desc')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="csv-file">{t('csv_file')}</Label>
                        <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleImport} disabled={isImporting || !selectedFile}>
                        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('upload_file')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('route_id')}</TableHead>
                      <TableHead>{t('route_name')}</TableHead>
                      <TableHead>{t('bus_type')}</TableHead>
                      <TableHead>{t('stops')}</TableHead>
                      <TableHead>{t('total_distance_km')}</TableHead>
                      <TableHead>{t('total_time_min')}</TableHead>
                      <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedRoutes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">{route.id}</TableCell>
                        <TableCell>{route.name}</TableCell>
                        <TableCell>{route.type}</TableCell>
                        <TableCell>{route.stops}</TableCell>
                        <TableCell>{route.distance.toFixed(2)}</TableCell>
                        <TableCell>{route.time}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
