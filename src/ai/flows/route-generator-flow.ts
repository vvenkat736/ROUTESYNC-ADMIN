
'use server';
/**
 * @fileOverview An AI flow for automatically generating bus routes from a list of stops.
 *
 * - generateRoutes - A function that fetches all stops and asks the AI to create logical routes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { generatePath, GeneratePathOutput } from './path-generator-flow';


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


// Helper function to get all available bus stops from Firestore
async function getStops(city: string): Promise<{ stop_id: string; stop_name: string; lat: number; lng: number; }[]> {
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

const StopInfoSchema = z.object({
  stop_id: z.string(),
  stop_name: z.string(),
  lat: z.number(),
  lng: z.number(),
});

// The prompt that instructs the AI how to generate routes
const prompt = ai.definePrompt({
  name: 'routeGeneratorPrompt',
  input: { schema: z.object({ stops: z.array(StopInfoSchema), city: z.string() }) },
  // The AI will only generate the route structure, not the detailed path.
  output: { schema: z.object({
      routes: z.array(z.object({
          route_id: z.string(),
          routeName: z.string(),
          busType: z.string(),
          stops: z.array(z.string()),
          totalDistance: z.number(),
          totalTime: z.number(),
      }))
  })},
  prompt: `You are a master transport logistics expert for the city of {{{city}}}, India.
Your task is to create a set of logical and efficient bus routes that connect the available bus stops provided to you.

Based on the list of stops below, you will create between 3 and 5 distinct bus routes. Each route should cover a logical area or connect important hubs (like 'Central Bus Stand', 'Chathiram', 'Srirangam', 'Thiruverumbur').

Available Stops:
{{#each stops}}
- {{stop_name}} (ID: {{stop_id}}, Lat: {{lat}}, Lng: {{lng}})
{{/each}}


For each route you generate, you must provide:
1.  A unique 'route_id' (e.g., R-01, R-02).
2.  A descriptive 'routeName' (e.g., 'Central Bus Stand to Thiruverumbur').
3.  A 'busType' (either 'Express', 'Deluxe', or 'Standard').
4.  An ordered list of 'stops' (the stop names). The order is critical and must represent a sensible path.
5.  An estimated 'totalDistance' in kilometers for the entire route.
6.  An estimated 'totalTime' in minutes for the entire route.

You will NOT generate the 'path' array of coordinates. That will be handled by a different process.

The final output must be a JSON object conforming to the required schema, containing a single key "routes" which is a list of the routes you have created.
`,
});


const generateRoutesFlow = ai.defineFlow(
  {
    name: 'generateRoutesFlow',
    inputSchema: z.string(),
    outputSchema: GenerateRoutesOutputSchema,
  },
  async (city) => {
    // Step 1: Explicitly fetch the stops first.
    const allStops = await getStops(city);
    const stopsMap = new Map(allStops.map(stop => [stop.stop_name, stop]));

    if (!allStops || allStops.length === 0) {
      throw new Error("No stops found in the database. Please import stops first.");
    }
    
    // Step 2: Pass the fetched stops to the AI to get the route structure.
    const { output: structuredRoutes } = await prompt({ stops: allStops, city });

    if (!structuredRoutes) {
      throw new Error("AI failed to generate routes. The model returned an empty response.");
    }

    // Step 3: For each generated route, call the path generator AI to get the accurate path.
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
            // Generate the detailed, road-accurate path
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
  }
);
