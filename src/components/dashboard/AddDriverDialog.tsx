
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
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { setDoc, doc, collection } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/AuthContext';

interface AddDriverDialogProps {
  onSuccess: () => void;
}

export function AddDriverDialog({ onSuccess }: AddDriverDialogProps) {
  const { t } = useLanguage();
  const { organization } = useAuth();
  const [driverId, setDriverId] = React.useState('');
  const [name, setName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!driverId || !name || !phoneNumber || !organization) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      // Create a new doc with an auto-generated ID in the 'drivers' collection
      const newDriverRef = doc(collection(db, 'drivers'));
      
      await setDoc(newDriverRef, {
        driverId: driverId,
        name: name,
        phoneNumber: phoneNumber,
        city: organization,
      });

      toast({ title: 'Driver Saved', description: 'The new driver has been added.' });
      onSuccess();
    } catch (error) {
      toast({ title: 'Error Saving Driver', variant: 'destructive' });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{t('add_driver_dialog_title')}</DialogTitle>
        <DialogDescription>{t('add_driver_dialog_desc')}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="driver-id" className="text-right">
            {t('driver_id')}
          </Label>
          <Input
            id="driver-id"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="col-span-3"
            placeholder="e.g., D001"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="driver-name" className="text-right">
            {t('driver_name')}
          </Label>
          <Input
            id="driver-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-3"
            placeholder="e.g., Suresh Kumar"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone-number" className="text-right">
            {t('phone_number')}
          </Label>
          <Input
            id="phone-number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="col-span-3"
            type="tel"
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('save_routes')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
