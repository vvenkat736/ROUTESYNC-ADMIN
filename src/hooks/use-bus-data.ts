
"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Bus } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';

export function useBusData() {
  const { organization } = useAuth();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to simulate small movements
  const simulateMovement = (currentBuses: Bus[]) => {
    return currentBuses.map(bus => {
      // Only move 'Active' buses
      if (bus.status !== 'Active') {
        return bus;
      }
      const latChange = (Math.random() - 0.5) * 0.0005;
      const lngChange = (Math.random() - 0.5) * 0.0005;
      return {
        ...bus,
        lat: bus.lat + latChange,
        lng: bus.lng + lngChange,
      };
    });
  };

  useEffect(() => {
    // Clear any existing simulation when organization changes
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

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

      // Clear previous interval if it exists
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }

      // Start simulation after data is fetched
      simulationIntervalRef.current = setInterval(() => {
        setBuses(prevBuses => simulateMovement(prevBuses));
      }, 3000); // Update every 3 seconds

    }, (error) => {
        console.error("Error fetching real-time bus data:", error);
        setIsLoading(false);
    });

    // Cleanup function
    return () => {
      unsubscribe();
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [organization]);

  return { buses, isLoading };
}
