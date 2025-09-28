
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { useLanguage } from "@/hooks/use-language";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
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
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, doc, deleteDoc, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AddDriverDialog } from "@/components/dashboard/AddDriverDialog";
import { EditDriverDialog } from "@/components/dashboard/EditDriverDialog";

export type Driver = {
    id: string;
    driverId: string;
    name: string;
    phoneNumber: string;
    city: string;
};

export default function DriversPage() {
  const { t } = useLanguage();
  const { organization } = useAuth();
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedDriver, setSelectedDriver] = React.useState<Driver | null>(null);

  const { toast } = useToast();
  
  React.useEffect(() => {
    if (!organization) {
      setDrivers([]);
      return;
    };

    const q = query(collection(db, "drivers"), where("city", "==", organization));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const driversData: Driver[] = [];
      querySnapshot.forEach((doc) => {
        driversData.push({ 
            id: doc.id,
            ...doc.data()
        } as Driver);
      });
      setDrivers(driversData);
    });

    return () => unsubscribe();
  }, [organization]);

  const handleDeleteDriver = async (driverId: string, driverName: string) => {
    try {
        await deleteDoc(doc(db, "drivers", driverId));
        toast({
            title: "Driver Deleted",
            description: `${driverName} has been removed successfully.`,
        });
    } catch (error) {
        console.error("Error deleting driver: ", error);
        toast({
            title: "Deletion Failed",
            description: "Could not delete the driver. Please try again.",
            variant: "destructive",
        });
    }
  };

  const handleEditClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditDialogOpen(true);
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
                <Users className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-semibold">{t('drivers')}</h1>
                </div>
                
                <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                    <CardTitle>{t('driver_management')}</CardTitle>
                    <CardDescription>{t('driver_management_desc')}</CardDescription>
                    </div>
                    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                {t('add_driver')}
                            </Button>
                        </DialogTrigger>
                        <AddDriverDialog onSuccess={() => setAddDialogOpen(false)} />
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>{t('driver_id')}</TableHead>
                        <TableHead>{t('driver_name')}</TableHead>
                        <TableHead>{t('phone_number')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                            <TableCell className="font-medium">{driver.driverId}</TableCell>
                            <TableCell>{driver.name}</TableCell>
                            <TableCell>{driver.phoneNumber}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(driver)}>
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
                                                    This action will permanently delete the driver "{driver.name}". This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteDriver(driver.id, driver.name)}>
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
          </main>
        </div>
      </div>
      {selectedDriver && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <EditDriverDialog 
                driver={selectedDriver}
                onSuccess={() => {
                    setEditDialogOpen(false);
                    setSelectedDriver(null);
                }}
            />
        </Dialog>
      )}
    </SidebarProvider>
  );
}
