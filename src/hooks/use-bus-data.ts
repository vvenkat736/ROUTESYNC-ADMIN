
"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Bus, Route } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';

export function useBusData(routes: Route[]) {
  const { organization } = useAuth();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs to store route data and bus simulation state to avoid re-renders
  const routePathsRef = useRef<Map<string, { lat: number; lng: number }[]>>(new Map());
  const busSimStateRef = useRef<Map<string, { pathIndex: number }>>(new Map());

  useEffect(() => {
    const routeMap = new Map<string, { lat: number; lng: number }[]>();
    routes.forEach(route => {
        if (route.path && route.path.length > 0) {
            routeMap.set(route.route_id, route.path);
        }
    });
    routePathsRef.current = routeMap;
  }, [routes]);


  const simulateMovement = (currentBuses: Bus[]) => {
    const routePaths = routePathsRef.current;
    if (routePaths.size === 0) return currentBuses; // Don't simulate if no routes are loaded

    return currentBuses.map(bus => {
      if (bus.status !== 'Active' || !bus.route) {
        return bus;
      }
      
      const path = routePaths.get(bus.route);
      if (!path || path.length === 0) {
        // If no path, just do a small random jiggle as a fallback
        const latChange = (Math.random() - 0.5) * 0.0005;
        const lngChange = (Math.random() - 0.5) * 0.0005;
        return { ...bus, lat: bus.lat + latChange, lng: bus.lng + lngChange };
      }

      let simState = busSimStateRef.current.get(bus.id);
      if (!simState) {
        // Find the closest point on the path to start the simulation
        let closestIndex = 0;
        let minDistance = Infinity;
        path.forEach((point, index) => {
            const distance = Math.sqrt(Math.pow(bus.lat - point.lat, 2) + Math.pow(bus.lng - point.lng, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });
        simState = { pathIndex: closestIndex };
      }

      // Move to the next point on the path
      const newIndex = (simState.pathIndex + 1) % path.length;
      const nextPoint = path[newIndex];
      
      busSimStateRef.current.set(bus.id, { pathIndex: newIndex });

      return {
        ...bus,
        lat: nextPoint.lat,
        lng: nextPoint.lng,
      };
    });
  };

  useEffect(() => {
    // Clear any existing simulation when organization changes
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    busSimStateRef.current.clear();

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
      }, 2000); // Update every 2 seconds

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
  }, [organization]); // Removed routes from dependency array to prevent re-triggering on route updates

  return { buses, isLoading };
}
