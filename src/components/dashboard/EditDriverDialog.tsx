
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
import { doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import type { Driver } from '@/app/drivers/page';

interface EditDriverDialogProps {
  driver: Driver;
  onSuccess: () => void;
}

export function EditDriverDialog({ driver, onSuccess }: EditDriverDialogProps) {
  const { t } = useLanguage();
  const [name, setName] = React.useState(driver.name);
  const [phoneNumber, setPhoneNumber] = React.useState(driver.phoneNumber);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!driver.id || !name || !phoneNumber) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const docRef = doc(db, 'drivers', driver.id);
      await updateDoc(docRef, {
        name: name,
        phoneNumber: phoneNumber,
      });

      toast({ title: 'Driver Updated', description: 'The driver details have been updated.' });
      onSuccess();
    } catch (error) {
      toast({ title: 'Error Updating Driver', variant: 'destructive' });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{t('edit_driver_dialog_title')}</DialogTitle>
        <DialogDescription>{t('edit_driver_dialog_desc')}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="driver-id" className="text-right">
            {t('driver_id')}
          </Label>
          <Input
            id="driver-id"
            value={driver.driverId}
            className="col-span-3"
            disabled
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
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
