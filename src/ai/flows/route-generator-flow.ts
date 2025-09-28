
'use server';
/**
 * @fileOverview An AI flow for automatically generating bus routes from a list of stops.
 *
 * - generateRoutes - A function that fetches all stops and asks the AI to create logical routes.
 */
import { z } from 'genkit';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { generatePath } from './path-generator-flow';
import type { GeneratePathOutput } from './path-generator-flow';

// Schema for a single point in a route's path
const PointSchema = z.object({
  lat: z.number().describe('The latitude of the stop.'),
  lng: z.number().describe('The longitude of the stop.'),
});

// The final output schema containing a list of generated routes
const GenerateRoutesOutputSchema = z.object({
  routes: z.array(z.object({
    route_id: z.string().describe("A unique ID for the route (e.g., 'R-01')."),
    routeName: z.string().describe("A descriptive name for the route (e.g., 'Central Bus Stand to Srirangam')."),
    busType: z.string().describe('The type of bus for the route (e.g., Express, Deluxe, Standard).'),
    stops: z.array(z.string()).describe('An ordered list of stop names that make up the route.'),
    path: z.array(PointSchema).describe('An ordered array of coordinates representing the entire route path.'),
    totalDistance: z.number().describe('The total distance of the route in kilometers.'),
    totalTime: z.number().describe('The total estimated run time for the route in minutes.'),
  })),
});
export type GenerateRoutesOutput = z.infer<typeof GenerateRoutesOutputSchema>;

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
function getDistance(p1: StopInfo, p2: StopInfo): number {
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

// Algorithmic Route Generation (Hub and Spoke)
async function createAlgorithmicRoutes(stops: StopInfo[], city: string) {
    const hubKeywords = ['central bus stand', 'chathiram', 'junction'];
    const hubs = stops.filter(s => hubKeywords.some(k => s.stop_name.toLowerCase().includes(k)));
    let spokes = stops.filter(s => !hubs.some(h => h.stop_id === s.stop_id));
    
    if (hubs.length === 0 && spokes.length > 0) {
        hubs.push(spokes.shift()!); // Use a random stop as a hub if none are found
    }
    if(spokes.length === 0) return [];

    const routes: Omit<z.infer<typeof GenerateRoutesOutputSchema>['routes'][0], 'path'>[] = [];
    let routeCounter = 1;
    const averageSpeedKmh = 25;

    for (const hub of hubs) {
        if (spokes.length === 0) break;

        // Find the 4 closest spokes to the current hub to form a route
        const sortedSpokes = spokes.sort((a, b) => getDistance(hub, a) - getDistance(hub, b));
        const routeStops = [hub, ...sortedSpokes.slice(0, 4)];
        
        // Remove these stops from the available spokes pool
        spokes = spokes.filter(s => !routeStops.some(rs => rs.stop_id === s.stop_id));

        // Create the route structure
        let totalDistance = 0;
        for (let i = 0; i < routeStops.length - 1; i++) {
            totalDistance += getDistance(routeStops[i], routeStops[i+1]);
        }
        const totalTime = Math.round((totalDistance / averageSpeedKmh) * 60);

        routes.push({
            route_id: `R-${routeCounter++}`,
            routeName: `${hub.stop_name} to ${routeStops[routeStops.length - 1].stop_name}`,
            busType: ['Express', 'Deluxe', 'Standard'][routeCounter % 3],
            stops: routeStops.map(s => s.stop_name),
            totalDistance: parseFloat(totalDistance.toFixed(2)),
            totalTime: totalTime,
        });
    }

    return { routes };
}


const generateRoutesFlow = async (city: string): Promise<GenerateRoutesOutput> => {
    const allStops = await getStops(city);
    const stopsMap = new Map(allStops.map(stop => [stop.stop_name, stop]));

    if (!allStops || allStops.length < 2) {
      throw new Error("At least 2 stops must be present to generate routes. Please import more stops.");
    }
    
    // Step 1: Generate route structures using an algorithm.
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

        let pathResult: GeneratePathOutput = { path: [] };
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
