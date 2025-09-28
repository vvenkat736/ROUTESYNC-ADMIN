
'use client';

import * as React from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { geocodeLocation, GeocodeOutput } from '@/ai/flows/geocode-flow';
import { Loader2, Search } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import type { Stop } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';

interface EditStopDialogProps {
  stop: Stop;
  onSuccess: () => void;
}

export function EditStopDialog({ stop, onSuccess }: EditStopDialogProps) {
  const { t } = useLanguage();
  const { organization } = useAuth();
  const [stopName, setStopName] = React.useState(stop.stop_name);
  const [lat, setLat] = React.useState(String(stop.lat));
  const [lng, setLng] = React.useState(String(stop.lng));
  const [note, setNote] = React.useState(stop.note);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isFinding, setIsFinding] = React.useState(false);
  const { toast } = useToast();

  const handleFindLocation = async () => {
    if (!stopName) {
      toast({ title: 'Stop name is required', variant: 'destructive' });
      return;
    }
    setIsFinding(true);
    try {
      const result: GeocodeOutput = await geocodeLocation({ location: stopName, city: organization || undefined });
      setLat(String(result.lat));
      setLng(String(result.lng));
      toast({
        title: 'Location Found',
        description: `Coordinates for ${result.name} have been filled.`,
      });
    } catch (error) {
      const errorMessage = (error as Error).message || 'Could not find location';
      toast({ 
        title: 'Geocoding Failed',
        description: errorMessage,
        variant: 'destructive' 
      });
      console.error(error);
    } finally {
      setIsFinding(false);
    }
  };

  const handleSave = async () => {
    if (!stop.stop_id || !stopName || !lat || !lng) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const docRef = doc(db, 'stops', stop.stop_id);
      await updateDoc(docRef, {
        stop_name: stopName,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        note: note,
      });

      toast({ title: 'Stop Updated', description: 'The stop has been updated successfully.' });
      onSuccess();
    } catch (error) {
      toast({ title: 'Error Updating Stop', variant: 'destructive' });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Stop</DialogTitle>
        <DialogDescription>Update the details for this bus stop.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="stop-name" className="text-right">
            Name
          </Label>
          <Input
            id="stop-name"
            value={stopName}
            onChange={(e) => setStopName(e.target.value)}
            className="col-span-2"
            placeholder="e.g., Rockfort Temple"
          />
          <Button onClick={handleFindLocation} disabled={isFinding} size="sm">
            {isFinding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Find
          </Button>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="stop-id" className="text-right">
            Stop ID
          </Label>
          <Input
            id="stop-id"
            value={stop.stop_id}
            className="col-span-3"
            disabled
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lat" className="text-right">
            Latitude
          </Label>
          <Input
            id="lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lng" className="text-right">
            Longitude
          </Label>
          <Input
            id="lng"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="note" className="text-right">
            Note
          </Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
