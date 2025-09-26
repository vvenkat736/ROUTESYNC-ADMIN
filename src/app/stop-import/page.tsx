
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { useLanguage } from "@/hooks/use-language";
import { MapPin, UploadCloud, Pencil, Trash2, Loader2, Search, Plus } from "lucide-react";
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
import { collection, onSnapshot, query, writeBatch, doc, addDoc, deleteDoc, getFirestore, setDoc } from "firebase/firestore";
import type { Stop } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { geocodeLocation, GeocodeOutput } from "@/ai/flows/geocode-flow";

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

export default function StopImportPage() {
  const { t } = useLanguage();
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

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
                if (!stop.stop_id) {
                    console.warn("Skipping row, missing stop_id:", stop);
                    return;
                }
                const docRef = doc(stopsCollection, stop.stop_id);
                batch.set(docRef, {
                  stop_name: stop.stop_name || '',
                  lat: parseFloat(stop.lat) || 0,
                  lng: parseFloat(stop.lng) || 0,
                  note: stop.note || ''
                });
            });

            await batch.commit();

            toast({
                title: "Import Successful",
                description: `${parsedStops.length} stops have been imported and stored.`,
            });
            setImportDialogOpen(false);
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
  
  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Are you sure you want to delete this stop?')) {
        return;
    }
    try {
        await deleteDoc(doc(db, "stops", stopId));
        toast({
            title: "Stop Deleted",
            description: "The stop has been removed successfully.",
        });
    } catch (error) {
        console.error("Error deleting stop: ", error);
        toast({
            title: "Deletion Failed",
            description: "Could not delete the stop. Please try again.",
            variant: "destructive",
        });
    }
  };


  const AddStopDialog = () => {
    const [stopId, setStopId] = React.useState('');
    const [stopName, setStopName] = React.useState('');
    const [lat, setLat] = React.useState('');
    const [lng, setLng] = React.useState('');
    const [note, setNote] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const [isFinding, setIsFinding] = React.useState(false);

    const handleFindLocation = async () => {
        if (!stopName) {
            toast({ title: "Stop name is required", variant: "destructive"});
            return;
        }
        setIsFinding(true);
        try {
            const result: GeocodeOutput = await geocodeLocation({ location: stopName });
            setLat(String(result.lat));
            setLng(String(result.lng));
            toast({ title: "Location Found", description: `Coordinates for ${result.name} have been filled.`});
        } catch (error) {
            toast({ title: "Could not find location", variant: "destructive"});
            console.error(error);
        } finally {
            setIsFinding(false);
        }
    }

    const handleSave = async () => {
        if (!stopId || !stopName || !lat || !lng) {
            toast({ title: "Please fill all required fields", variant: "destructive"});
            return;
        }
        setIsSaving(true);
        try {
            const docRef = doc(db, 'stops', stopId);
            await setDoc(docRef, {
                stop_name: stopName,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                note: note
            });

            toast({ title: "Stop Saved", description: "The new stop has been added."});
            setAddDialogOpen(false);
        } catch(error) {
            toast({ title: "Error Saving Stop", variant: "destructive"});
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('add_stop_manually')}</DialogTitle>
          <DialogDescription>{t('add_stop_manually_desc')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stop-name" className="text-right">Name</Label>
                <Input id="stop-name" value={stopName} onChange={(e) => setStopName(e.target.value)} className="col-span-2" placeholder="e.g., Rockfort Temple"/>
                <Button onClick={handleFindLocation} disabled={isFinding} size="sm">
                    {isFinding ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                    Find
                </Button>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stop-id" className="text-right">Stop ID</Label>
                <Input id="stop-id" value={stopId} onChange={(e) => setStopId(e.target.value)} className="col-span-3" placeholder="e.g., S26"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lat" className="text-right">Latitude</Label>
                <Input id="lat" value={lat} onChange={(e) => setLat(e.target.value)} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lng" className="text-right">Longitude</Label>
                <Input id="lng" value={lng} onChange={(e) => setLng(e.target.value)} className="col-span-3"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="note" className="text-right">Note</Label>
                <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} className="col-span-3"/>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Stop
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
            <Sidebar className="border-r" side="left" collapsible="offcanvas">
            <SidebarNav />
            </Sidebar>
            <main className="p-4 lg:p-6 flex-1">
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
                    <div className="flex gap-2">
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('add_manually')}
                                </Button>
                            </DialogTrigger>
                            <AddStopDialog />
                        </Dialog>
                        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
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
                    </div>
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
                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDeleteStop(stop.stop_id)}>
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
