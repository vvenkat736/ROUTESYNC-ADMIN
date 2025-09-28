
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

// Hub-and-Spoke Route Generation Algorithm
async function createAlgorithmicRoutes(stops: StopInfo[], city: string) {
    const averageSpeedKmh = 25;
    
    const hubNames: { [key: string]: string[] } = {
        trichy: ['Central Bus Stand', 'Panjapur'],
        tanjavur: ['Tanjavur Old Bus Stand', 'Tanjavur New Bus Stand'],
        erode: ['Erode Central Bus Terminus', 'Erode Junction'],
        salem: ['Salem New Bus Stand', 'Salem Old Bus Stand'],
    };

    const mainHubNames = hubNames[city] || (stops.length > 1 ? [stops[0].stop_name, stops[1].stop_name] : []);
    const mainHubs = stops.filter(s => mainHubNames.includes(s.stop_name));

    if (mainHubs.length < 2) {
        throw new Error(`Could not find the two main bus stands for ${city}. Please ensure they are present in the stops data.`);
    }

    const otherStops = stops.filter(s => !mainHubNames.includes(s.stop_name));
    
    // Assign each stop to the nearest hub
    const hubZones: { [key: string]: StopInfo[] } = {};
    mainHubs.forEach(hub => hubZones[hub.stop_name] = []);
    
    otherStops.forEach(stop => {
        let closestHub: StopInfo | null = null;
        let minDistance = Infinity;
        mainHubs.forEach(hub => {
            const distance = getDistance(stop, hub);
            if (distance < minDistance) {
                minDistance = distance;
                closestHub = hub;
            }
        });
        if (closestHub) {
            hubZones[closestHub.stop_name].push(stop);
        }
    });

    let routeCounter = 1;
    const finalRoutes: any[] = [];

    for (const hub of mainHubs) {
        const zoneStops = hubZones[hub.stop_name];
        if (zoneStops.length === 0) continue;

        // Sub-cluster the stops in this hub's zone
        const numSubRoutes = Math.max(1, Math.floor(zoneStops.length / 5)); // 5 stops per sub-route
        let centroids = zoneStops.slice(0, numSubRoutes).map(stop => ({ lat: stop.lat, lng: stop.lng }));
        let clusters: StopInfo[][] = Array.from({ length: numSubRoutes }, () => []);

        for (let i = 0; i < 5; i++) { // Iterate a few times for convergence
            clusters = Array.from({ length: numSubRoutes }, () => []);
            zoneStops.forEach(stop => {
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

        // Create a route for each sub-cluster, starting from the main hub
        clusters.filter(c => c.length > 0).forEach((cluster, index) => {
            const routeStops = [hub, ...cluster];
            let orderedStops: StopInfo[] = [];
            let unvisited = [...routeStops];
            let currentStop = unvisited.find(s => s.stop_name === hub.stop_name)!;
            unvisited = unvisited.filter(s => s.stop_name !== hub.stop_name);
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
                    break;
                }
            }

            let totalDistance = 0;
            for (let i = 0; i < orderedStops.length - 1; i++) {
                totalDistance += getDistance(orderedStops[i], orderedStops[i + 1]);
            }
            const totalTime = Math.round((totalDistance / averageSpeedKmh) * 60);

            finalRoutes.push({
                route_id: `R-${city.substring(0,2).toUpperCase()}-${routeCounter++}`,
                routeName: `${hub.stop_name} Route ${index + 1}`,
                busType: "Standard",
                stops: orderedStops.map(s => s.stop_name),
                totalDistance: parseFloat(totalDistance.toFixed(2)),
                totalTime: totalTime,
            });
        });
    }
    
    return { routes: finalRoutes };
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

        try {
            let pathResult: { path: { lat: number; lng: number; }[] } = { path: [] };
            if (stopCoordinates.length > 1) {
                pathResult = await generatePath({ stops: stopCoordinates });
            } else if (stopCoordinates.length === 1) {
                pathResult = { path: stopCoordinates };
            }
            return {
                ...route,
                path: pathResult.path,
            };
        } catch (error) {
            console.error(`Failed to generate path for route ${route.routeName}. Falling back to straight lines.`, error);
            // Fallback to a straight-line path if the AI fails
            return {
                ...route,
                path: stopCoordinates,
            };
        }
      })
    );

    return { routes: finalRoutes };
};
