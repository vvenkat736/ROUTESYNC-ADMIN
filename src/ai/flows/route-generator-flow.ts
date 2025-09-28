
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

// Define schemas for types
export const PointSchema = z.object({
  lat: z.number().describe('The latitude of the stop.'),
  lng: z.number().describe('The longitude of the stop.'),
});

export const GenerateRoutesOutputSchema = z.object({
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

// Hardcoded Algorithmic Route Generation
async function createAlgorithmicRoutes(stops: StopInfo[], city: string) {
    const stopsMap = new Map(stops.map(s => [s.stop_name, s]));
    const averageSpeedKmh = 25;
    let routeCounter = 1;

    // Define route structures with stop names
    const routeDefinitions = [
        { routeName: "Central Bus Stand Circle", busType: "Express", stops: ["Central Bus Stand", "Heber Road", "Puthur", "Thillai Nagar", "Chathiram", "Rockfort", "Central Bus Stand"] },
        { routeName: "Outer Ring Connector", busType: "Deluxe", stops: ["Chathiram", "Palpannai", "Melapudur", "NN Road", "Thiruverumbur", "BHEL / Kailasapuram"] },
        { routeName: "North-South Express", busType: "Standard", stops: ["Samayapuram", "No.1 Toll Gate", "Srirangam", "Chathiram", "Central Bus Stand", "Mannarpuram", "Trichy Airport"] },
        { routeName: "West-East Connector", busType: "Express", stops: ["Mutharasanallur", "Woraiyur", "Chathiram", "Sanjeevi Nagar", "Palpannai", "KKBT terminus"] },
        { routeName: "City Core Loop", busType: "Deluxe", stops: ["Panjapur", "Iluppur Road", "Bharathi Nagar", "Sastri Road", "Central Bus Stand", "Panjapur"] },
    ];

    const routes = routeDefinitions.map(routeDef => {
        const validStops = routeDef.stops.map(name => stopsMap.get(name)).filter((s): s is StopInfo => !!s);
        
        if (validStops.length < 2) return null;

        let totalDistance = 0;
        for (let i = 0; i < validStops.length - 1; i++) {
            totalDistance += getDistance(validStops[i], validStops[i + 1]);
        }
        const totalTime = Math.round((totalDistance / averageSpeedKmh) * 60);
        
        return {
            route_id: `R-${routeCounter++}`,
            routeName: routeDef.routeName,
            busType: routeDef.busType,
            stops: validStops.map(s => s.stop_name),
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
    
    // Step 1: Generate route structures using a hardcoded algorithm.
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
