
'use server';
/**
 * @fileOverview An AI flow for generating bus routes from a list of stops.
 *
 * - generateRoutes - A function that fetches all stops and uses an AI to generate routes.
 */
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { generatePath } from './path-generator-flow';
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

// Input for the main AI prompt
const GenerateRoutesPromptInputSchema = z.object({
    city: z.string(),
    stops: z.array(z.object({
        stop_id: z.string(),
        stop_name: z.string(),
        lat: z.number(),
        lng: z.number(),
    })),
    numRoutes: z.number().describe("The desired number of routes to generate."),
});

// The structure of a single route as defined by the AI
const AiRouteSchema = z.object({
    route_id: z.string().describe("A unique identifier for the route, e.g., R-TR-1."),
    routeName: z.string().describe("A descriptive name for the route, e.g., 'Central Station to Srirangam'."),
    busType: z.string().describe("The type of bus service, e.g., 'Express', 'Standard', 'Deluxe'."),
    stops: z.array(z.string()).describe("An ordered list of stop_name for this route."),
});


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

// Define the main prompt for route generation
const routeGeneratorPrompt = ai.definePrompt({
    name: 'routeGeneratorPrompt',
    input: { schema: GenerateRoutesPromptInputSchema },
    output: { schema: z.object({ routes: z.array(AiRouteSchema) }) },
    prompt: `You are a transit logistics expert for the city of {{{city}}}, India.
Your task is to create a set of {{{numRoutes}}} logical and efficient bus routes using the provided list of bus stops.

- Each route must have a unique route_id (e.g., R-CITY-1, R-CITY-2).
- Each route must have a descriptive routeName.
- The stops in each route must be logically ordered to form a sensible path.
- Try to use all available stops, but do not use the same stop in multiple routes unless it is a major hub.
- The busType can be 'Express', 'Standard', or 'Deluxe'.

Here are the available stops:
{{#each stops}}
- {{stop_name}} (ID: {{stop_id}})
{{/each}}

Please generate exactly {{{numRoutes}}} routes.
`,
});


// The main exported function that the UI will call
export async function generateRoutes(city: string): Promise<GenerateRoutesOutput> {
  try {
    const stops = await getStopsTool({city});
    if (!stops || stops.length < 2) {
      throw new Error("At least 2 stops must be present to generate routes. Please import more stops.");
    }
    
    // Determine how many routes to generate. A simple heuristic.
    const numRoutes = Math.max(1, Math.min(7, Math.floor(stops.length / 5)));

    // Get the AI to define the routes
    const { output: aiRoutes } = await routeGeneratorPrompt({ city, stops, numRoutes });

    if (!aiRoutes || !aiRoutes.routes || aiRoutes.routes.length === 0) {
        throw new Error("The AI failed to generate any routes. Please try again.");
    }

    const stopsMap = new Map(stops.map(s => [s.stop_name, s]));

    // For each AI-defined route, generate the full path and calculate metrics
    const finalRoutes = await Promise.all(
      aiRoutes.routes.map(async (route) => {
        const stopCoordinates = route.stops
          .map(stopName => {
            const stop = stopsMap.get(stopName);
            return stop ? { lat: stop.lat, lng: stop.lng } : null;
          })
          .filter((s): s is Point => s !== null);

        let path: Point[] = [];
        if (stopCoordinates.length > 1) {
          try {
            const pathResult = await generatePath({ stops: stopCoordinates });
            path = pathResult.path;
          } catch (error) {
             console.error(`Failed to generate path for route ${route.routeName}. Falling back to straight lines.`, error);
             path = stopCoordinates;
          }
        } else {
            path = stopCoordinates;
        }

        // Simple distance and time calculation
        let totalDistance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            totalDistance += getHaversineDistance(path[i], path[i+1]);
        }
        const totalTime = Math.round(totalDistance / (20 / 60)); // Avg speed 20km/h

        return {
          ...route,
          path: path,
          totalDistance,
          totalTime,
        };
      })
    );
  
    return { routes: finalRoutes };

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
