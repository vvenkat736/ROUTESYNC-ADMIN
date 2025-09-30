
'use server';
/**
 * @fileOverview An AI flow for generating bus routes from a list of stops.
 *
 * - generateRoutes - A function that fetches all stops and uses an AI to generate routes.
 */
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

type Point = {
  lat: number;
  lng: number;
};

// The final output structure remains the same
export type GenerateRoutesOutput = {
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

// Tool for the AI to get available stops
export const getStopsTool = ai.defineTool(
    {
      name: 'getStops',
      description: 'Get the list of all available bus stops and their locations for a specific city.',
      inputSchema: z.object({ city: z.string() }),
      outputSchema: z.array(z.object({
          stop_id: z.string(),
          stop_name: z.string(),
          lat: z.number(),
          lng: z.number(),
      })),
    },
    async ({city}) => {
        const db = getFirestore(app);
        const q = query(collection(db, "stops"), where("city", "==", city));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            throw new Error(`No stops found for city: ${city}. Please import stops first.`);
        }
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                stop_id: doc.id,
                ...data,
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng),
            } as any;
        });
    }
);

// The main exported function that the UI will call
export async function generateRoutes(city: string): Promise<GenerateRoutesOutput> {
  try {
    const stops = await getStopsTool({city});
    if (!stops || stops.length < 2) {
      throw new Error("At least 2 stops must be present to generate routes. Please import more stops.");
    }
    
    const path = stops.map(s => ({ lat: s.lat, lng: s.lng }));

    // Simple distance and time calculation
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        totalDistance += getHaversineDistance(path[i], path[i+1]);
    }
    const totalTime = Math.round(totalDistance / (20 / 60)); // Avg speed 20km/h

    const finalRoute = {
      route_id: `R-${city.substring(0,3).toUpperCase()}-FULL`,
      routeName: `Full City Route for ${city}`,
      busType: 'Standard',
      stops: stops.map(s => s.stop_name),
      path: path,
      totalDistance,
      totalTime,
    };
  
    return { routes: [finalRoute] };

  } catch (error: any) {
    if (error.message && error.message.includes('Service Unavailable')) {
      throw new Error("The route generation service is temporarily unavailable. Please try again in a few moments.");
    }
    throw error;
  }
}

// Helper function to calculate distance between two points
function getHaversineDistance(p1: Point, p2: Point) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


// Define the flow for Genkit inspection
const generateRoutesFlow = ai.defineFlow(
    {
        name: 'generateRoutesFlow',
        inputSchema: z.object({ city: z.string() }),
        outputSchema: z.custom<GenerateRoutesOutput>(),
    },
    async ({ city }) => {
        return generateRoutes(city);
    }
);
