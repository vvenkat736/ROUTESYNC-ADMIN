
"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Bus } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';

export function useBusData() {
  const { organization } = useAuth();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!organization) {
      setBuses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(collection(db, "buses"), where("city", "==", organization));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const busesData: Bus[] = [];
      querySnapshot.forEach((doc) => {
        busesData.push({ id: doc.id, ...doc.data() } as Bus);
      });
      setBuses(busesData);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching real-time bus data:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [organization]);

  return { buses, isLoading };
}
