
'use server';
/**
 * @fileOverview An AI flow for automatically generating bus routes from a list of stops.
 *
 * - generateRoutes - A function that fetches all stops and asks the AI to create logical routes.
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

const getStopsTool = ai.defineTool(
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
    return await generateRoutesFlow({city});
  } catch (error: any) {
    if (error.message && error.message.includes('Service Unavailable')) {
      throw new Error("The route generation service is temporarily unavailable. Please try again in a few moments.");
    }
    throw error;
  }
}

const prompt = ai.definePrompt({
    name: 'routeGeneratorPrompt',
    input: { schema: z.object({ city: z.string() }) },
    output: { schema: z.object({
        routes: z.array(z.object({
            route_id: z.string().describe('A short, unique identifier for the route (e.g., R-TR-1).'),
            routeName: z.string().describe('A descriptive name for the route (e.g., Central Station to Srirangam).'),
            busType: z.string().describe('The type of bus service (e.g., Express, Deluxe, Standard).'),
            stops: z.array(z.string()).describe('An ordered list of stop names for this route.'),
            totalDistance: z.number().describe('The total distance of the route in kilometers.'),
            totalTime: z.number().describe('The total estimated run time for the route in minutes.'),
        }))
    }) },
    tools: [getStopsTool],
    prompt: `You are an expert urban transit planner for cities in India. Your task is to create a logical set of bus routes for the city of {{{city}}}.

    1.  First, use the 'getStops' tool to get a complete list of all available bus stops for {{{city}}}.
    2.  Analyze the list of stops. Identify major hubs (like main bus stands, train stations, major markets) and clusters of stops.
    3.  Create a set of distinct routes that provide good coverage for the city. Aim for 5-7 routes.
    4.  Each route should have a logical progression of stops. Order the stops in a sequence that makes sense for a bus to travel.
    5.  Ensure that every single stop from the 'getStops' tool output is included in at least one route. Do not leave any stops isolated.
    6.  For each route, provide a unique route_id, a descriptive routeName, a busType, the ordered list of stops, the totalDistance (in km), and the totalTime (in minutes). You can estimate distance and time based on the number of stops and general urban travel speeds (assume ~20-25 km/h).
    
    Generate a complete and logical bus network for {{{city}}}.`,
});


const generateRoutesFlow = ai.defineFlow(
    {
        name: 'generateRoutesFlow',
        inputSchema: z.object({ city: z.string() }),
        outputSchema: z.custom<GenerateRoutesOutput>(),
    },
    async (input) => {
        const allStops = await getStopsTool(input);
        const stopsMap = new Map(allStops.map(stop => [stop.stop_name, stop]));

        if (!allStops || allStops.length < 2) {
            throw new Error("At least 2 stops must be present to generate routes. Please import more stops.");
        }
        
        // Step 1: Ask the AI to generate the route structures.
        const { output: structuredRoutes } = await prompt(input);

        if (!structuredRoutes || structuredRoutes.routes.length === 0) {
            throw new Error("AI failed to generate routes. The model returned an empty response.");
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
    }
);
