
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
import { doc, setDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';

interface AddStopDialogProps {
  onSuccess: () => void;
}

export function AddStopDialog({ onSuccess }: AddStopDialogProps) {
  const { t } = useLanguage();
  const [stopId, setStopId] = React.useState('');
  const [stopName, setStopName] = React.useState('');
  const [lat, setLat] = React.useState('');
  const [lng, setLng] = React.useState('');
  const [note, setNote] = React.useState('');
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
      const result: GeocodeOutput = await geocodeLocation({ location: stopName });
      setLat(String(result.lat));
      setLng(String(result.lng));
      toast({
        title: 'Location Found',
        description: `Coordinates for ${result.name} have been filled.`,
      });
    } catch (error) {
      toast({ title: 'Could not find location', variant: 'destructive' });
      console.error(error);
    } finally {
      setIsFinding(false);
    }
  };

  const handleSave = async () => {
    if (!stopId || !stopName || !lat || !lng) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const docRef = doc(db, 'stops', stopId);
      await setDoc(docRef, {
        stop_name: stopName,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        note: note,
      });

      toast({ title: 'Stop Saved', description: 'The new stop has been added.' });
      onSuccess();
    } catch (error) {
      toast({ title: 'Error Saving Stop', variant: 'destructive' });
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
            value={stopId}
            onChange={(e) => setStopId(e.target.value)}
            className="col-span-3"
            placeholder="e.g., S26"
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
          Save Stop
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
