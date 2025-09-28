

"use client";

import * as React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { useLanguage } from "@/hooks/use-language";
import { MapPin, UploadCloud, Pencil, Trash2, Loader2, Plus, AlertTriangle } from "lucide-react";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, writeBatch, doc, deleteDoc, getDocs } from "firebase/firestore";
import type { Stop } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { AddStopDialog } from "@/components/dashboard/AddStopDialog";
import { useAuth } from "@/contexts/AuthContext";
import { EditStopDialog } from "@/components/dashboard/EditStopDialog";
import { processAndStoreStops } from "@/ai/flows/stop-importer-flow";

export default function StopImportPage() {
  const { t } = useLanguage();
  const { organization } = useAuth();
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedStop, setSelectedStop] = React.useState<Stop | null>(null);

  const { toast } = useToast();

  const fetchStops = async () => {
    if (!organization) return;
    const q = query(collection(db, "stops"), where("city", "==", organization));
    const querySnapshot = await getDocs(q);
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
    setStops(stopsData);
  };

  React.useEffect(() => {
    if (!organization) {
      setStops([]);
      return;
    };

    const q = query(collection(db, "stops"), where("city", "==", organization));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
      setStops(stopsData);
    });

    return () => unsubscribe();
  }, [organization]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !organization) {
        toast({
            title: "No file selected or not logged in",
            description: "Please select a CSV file to import and ensure you are logged in.",
            variant: "destructive",
        });
        return;
    }

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
            const result = await processAndStoreStops({ csvContent: content, city: organization });
            toast({
                title: "Import Successful",
                description: `${result.count} stops have been imported for ${organization}.`,
            });
            setImportDialogOpen(false);
        } catch (error) {
            console.error("Error importing stops:", error);
            const errorMessage = (error as Error).message || "There was an error processing your file.";
            toast({
                title: "Import Failed",
                description: errorMessage,
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

  const handleEditClick = (stop: Stop) => {
    setSelectedStop(stop);
    setEditDialogOpen(true);
  };

  const handleDeleteDataset = async () => {
    if (!organization) return;

    try {
        const q = query(collection(db, "stops"), where("city", "==", organization));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            toast({ title: "No stops to delete.", variant: "default" });
            return;
        }

        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        toast({
            title: t('delete_success'),
            description: t('delete_success_desc'),
        });
    } catch (error) {
        console.error("Error deleting dataset: ", error);
        toast({
            title: t('delete_error'),
            description: t('delete_error_desc'),
            variant: "destructive",
        });
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
                    <div className="flex gap-2">
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('add_manually')}
                                </Button>
                            </DialogTrigger>
                            <AddStopDialog onSuccess={() => {
                                setAddDialogOpen(false);
                                fetchStops();
                            }} />
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
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(stop)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action will permanently delete the stop "{stop.stop_name}". This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteStop(stop.stop_id)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
                </Card>
                <Card className="mt-6 border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle />
                            {t('delete_dataset')}
                        </CardTitle>
                        <CardDescription>
                            {t('delete_dataset_confirm_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('delete_dataset')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t('delete_dataset_confirm_title')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('delete_dataset_confirm_desc')}
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteDataset}>
                                    Continue
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
          </main>
        </div>
      </div>
      {selectedStop && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <EditStopDialog 
                stop={selectedStop}
                onSuccess={() => {
                    setEditDialogOpen(false);
                    setSelectedStop(null);
                }}
            />
        </Dialog>
      )}
    </SidebarProvider>
  );
}
