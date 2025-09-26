
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { useLanguage } from "@/hooks/use-language";
import { MapPin, UploadCloud, Pencil, Trash2, Loader2 } from "lucide-react";
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
import { collection, onSnapshot, query, writeBatch, doc } from "firebase/firestore";
import type { Stop } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

// Simple CSV to JSON parser
const parseCSV = (content: string): any[] => {
  const lines = content.split('\\n').filter(line => line.trim() !== '');
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


export default function StopImportPage() {
  const { t } = useLanguage();
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, "stops"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const stopsData: Stop[] = [];
      querySnapshot.forEach((doc) => {
        stopsData.push({ stop_id: doc.id, ...doc.data() } as Stop);
      });
      setStops(stopsData);
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
            const parsedStops = parseCSV(content);
            if (parsedStops.length === 0) {
              throw new Error("CSV is empty or invalid.");
            }

            const db = getFirestore();
            const batch = writeBatch(db);
            const stopsCollection = collection(db, 'stops');

            parsedStops.forEach(stop => {
                const docRef = doc(stopsCollection, stop.stop_id);
                batch.set(docRef, {
                  stop_name: stop.stop_name,
                  lat: parseFloat(stop.lat),
                  lng: parseFloat(stop.lng),
                  note: stop.note
                });
            });

            await batch.commit();

            toast({
                title: "Import Successful",
                description: `${parsedStops.length} stops have been imported and stored.`,
            });
            setDialogOpen(false);
        } catch (error) {
            console.error("Error importing stops:", error);
            toast({
                title: "Import Failed",
                description: "There was an error processing your file. Please check the file format and content.",
                variant: "destructive",
            });
        } finally {
            setIsImporting(false);
            setSelectedFile(null);
        }
    };
    reader.readAsText(selectedFile);
  };

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
              <MapPin className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-semibold">{t('stop_import')}</h1>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('stop_management')}</CardTitle>
                  <CardDescription>{t('stop_management_desc')}</CardDescription>
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
                      <DialogTitle>{t('import_stops_csv')}</DialogTitle>
                      <DialogDescription>
                        {t('import_stops_csv_desc')}
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
                      <TableHead>{t('stop_id')}</TableHead>
                      <TableHead>{t('stop_name')}</TableHead>
                      <TableHead>{t('latitude')}</TableHead>
                      <TableHead>{t('longitude')}</TableHead>
                      <TableHead>{t('note')}</TableHead>
                      <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stops.map((stop) => (
                      <TableRow key={stop.stop_id}>
                        <TableCell className="font-medium">{stop.stop_id}</TableCell>
                        <TableCell>{stop.stop_name}</TableCell>
                        <TableCell>{stop.lat}</TableCell>
                        <TableCell>{stop.lng}</TableCell>
                        <TableCell>{stop.note}</TableCell>
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
