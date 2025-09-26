
"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud, Pencil, Trash2, Loader2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query } from "firebase/firestore"
import type { Route } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { processAndStoreRoutes } from "@/ai/flows/route-importer-flow"

export function RouteManagement() {
  const { t } = useLanguage()
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, "routes"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const routesData: Route[] = [];
      querySnapshot.forEach((doc) => {
        routesData.push({ id: parseInt(doc.id), ...doc.data() } as Route);
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
            await processAndStoreRoutes({ csvContent: content });
            toast({
                title: "Import Successful",
                description: "The routes have been imported and stored in Firebase.",
            });
            setDialogOpen(false);
        } catch (error) {
            console.error("Error importing routes:", error);
            toast({
                title: "Import Failed",
                description: "There was an error processing your file.",
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
              <TableHead>{t('stops')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.slice(0, 3).map((route) => (
              <TableRow key={route.id}>
                <TableCell className="font-medium">{t('route')} {route.id}</TableCell>
                <TableCell>{route.stops}</TableCell>
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
  )
}
