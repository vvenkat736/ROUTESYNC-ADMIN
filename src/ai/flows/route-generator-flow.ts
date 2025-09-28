
'use server';
/**
 * @fileOverview An AI flow for automatically generating bus routes from a list of stops.
 *
 * - generateRoutes - A function that fetches all stops and asks the AI to create logical routes.
 */
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { generatePath } from './path-generator-flow';

type Point = {
  lat: number;
  lng: number;
};

type GenerateRoutesOutput = {
  routes: {
    route_id: string;
    routeName: string;
    busType: string;
    stops: string[];
    path: Point[];
    totalDistance: number;
    totalTime: number;
  }[];
};

type StopInfo = {
    stop_id: string;
    stop_name: string;
    lat: number;
    lng: number;
};

// Helper function to get all available bus stops from Firestore
async function getStops(city: string): Promise<StopInfo[]> {
    const db = getFirestore(app);
    const q = query(collection(db, "stops"), where("city", "==", city));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            stop_id: doc.id,
            stop_name: data.stop_name,
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lng),
        };
    });
}

// Haversine distance calculation
function getDistance(p1: {lat: number, lng: number}, p2: {lat: number, lng: number}): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


// The main exported function that the UI will call
export async function generateRoutes(city: string): Promise<GenerateRoutesOutput> {
  try {
    return await generateRoutesFlow(city);
  } catch (error: any) {
    if (error.message && error.message.includes('Service Unavailable')) {
      throw new Error("The route generation service is temporarily unavailable. Please try again in a few moments.");
    }
    throw error;
  }
}

// K-Means Clustering and Nearest Neighbor Algorithm
async function createAlgorithmicRoutes(stops: StopInfo[], city: string) {
    const stopsMap = new Map(stops.map(s => [s.stop_name, s]));
    const averageSpeedKmh = 25;
    const numRoutes = Math.min(5, Math.floor(stops.length / 3)); // Aim for 5 routes, or fewer if not enough stops

    if (numRoutes < 1) {
        return { routes: [] };
    }

    // 1. K-Means Clustering to group stops
    let centroids = stops.slice(0, numRoutes).map(stop => ({ lat: stop.lat, lng: stop.lng }));
    let clusters: StopInfo[][] = Array.from({ length: numRoutes }, () => []);

    for (let i = 0; i < 10; i++) { // Iterate a few times for convergence
        clusters = Array.from({ length: numRoutes }, () => []);
        stops.forEach(stop => {
            let minDistance = Infinity;
            let closestCentroidIndex = 0;
            centroids.forEach((centroid, index) => {
                const distance = getDistance(stop, centroid);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCentroidIndex = index;
                }
            });
            clusters[closestCentroidIndex].push(stop);
        });

        centroids = clusters.map(cluster => {
            if (cluster.length === 0) return { lat: 0, lng: 0 };
            const sumLat = cluster.reduce((sum, stop) => sum + stop.lat, 0);
            const sumLng = cluster.reduce((sum, stop) => sum + stop.lng, 0);
            return { lat: sumLat / cluster.length, lng: sumLng / cluster.length };
        }).filter(c => c.lat !== 0);
    }
    
    // 2. Nearest Neighbor within each cluster to form a path
    let routeCounter = 1;
    const routes = clusters.map((cluster, index) => {
        if (cluster.length < 2) return null;

        let unvisited = [...cluster];
        let orderedStops: StopInfo[] = [];
        let currentStop = unvisited.splice(0, 1)[0]; // Start with the first stop
        orderedStops.push(currentStop);

        while (unvisited.length > 0) {
            let nearestStop: StopInfo | null = null;
            let minDistance = Infinity;
            let nearestIndex = -1;

            unvisited.forEach((stop, idx) => {
                const distance = getDistance(currentStop, stop);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestStop = stop;
                    nearestIndex = idx;
                }
            });
            
            if (nearestStop && nearestIndex > -1) {
                orderedStops.push(nearestStop);
                currentStop = unvisited.splice(nearestIndex, 1)[0];
            } else {
                break; // Should not happen if unvisited is not empty
            }
        }
        
        // Calculate total distance and time for the ordered route
        let totalDistance = 0;
        for (let i = 0; i < orderedStops.length - 1; i++) {
            totalDistance += getDistance(orderedStops[i], orderedStops[i + 1]);
        }
        const totalTime = Math.round((totalDistance / averageSpeedKmh) * 60);

        return {
            route_id: `R-${city.substring(0,2).toUpperCase()}-${routeCounter++}`,
            routeName: `Route Cluster ${index + 1}`,
            busType: "Standard",
            stops: orderedStops.map(s => s.stop_name),
            totalDistance: parseFloat(totalDistance.toFixed(2)),
            totalTime: totalTime,
        };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
    
    return { routes };
}


const generateRoutesFlow = async (city: string): Promise<GenerateRoutesOutput> => {
    const allStops = await getStops(city);
    const stopsMap = new Map(allStops.map(stop => [stop.stop_name, stop]));

    if (!allStops || allStops.length < 2) {
      throw new Error("At least 2 stops must be present to generate routes. Please import more stops.");
    }
    
    // Step 1: Generate route structures using a dynamic algorithm.
    const structuredRoutes = await createAlgorithmicRoutes(allStops, city);

    if (!structuredRoutes || structuredRoutes.routes.length === 0) {
      throw new Error("Algorithm failed to generate routes. Check if you have enough stops.");
    }

    // Step 2: For each generated route, call the path generator AI to get the accurate path.
    const finalRoutes = await Promise.all(
      structuredRoutes.routes.map(async (route) => {
        const stopCoordinates = route.stops
            .map(stopName => {
                const stop = stopsMap.get(stopName);
                if (!stop) return null;
                return { lat: stop.lat, lng: stop.lng };
            })
            .filter((s): s is { lat: number; lng: number } => s !== null);

        let pathResult: { path: { lat: number; lng: number; }[] } = { path: [] };
        if (stopCoordinates.length > 1) {
            pathResult = await generatePath({ stops: stopCoordinates });
        } else if (stopCoordinates.length === 1) {
            pathResult = { path: stopCoordinates };
        }


        return {
          ...route,
          path: pathResult.path, // Add the accurate path to the final route object
        };
      })
    );

    return { routes: finalRoutes };
};
