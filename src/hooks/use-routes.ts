
"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Route } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';

export function useRoutes() {
  const { organization } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!organization) {
      setRoutes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(collection(db, "routes"), where("city", "==", organization));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const routesData: Route[] = [];
      querySnapshot.forEach((doc) => {
        routesData.push({ id: doc.id, ...doc.data() } as Route);
      });
      
      setRoutes(routesData);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching real-time route data:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [organization]);

  return { routes, isLoading };
}
