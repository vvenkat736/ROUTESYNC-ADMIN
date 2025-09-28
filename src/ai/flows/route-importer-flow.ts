
'use server';
/**
 * @fileOverview An AI flow for processing and storing bus routes from a CSV file.
 *
 * - processAndStoreRoutes - A function that takes CSV content, parses it, and stores it in Firestore.
 * - ProcessRoutesInput - The input type for the processAndStoreRoutes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, doc, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { generatePath } from './path-generator-flow';

// Define the input schema for the flow
const ProcessRoutesInputSchema = z.object({
  csvContent: z.string().describe('The full content of the CSV file.'),
  city: z.string().describe('The city these routes belong to.'),
});
type ProcessRoutesInput = z.infer<typeof ProcessRoutesInputSchema>;

// Point schema for geographic coordinates
const PointSchema = z.object({
  lat: z.number().describe('The latitude of the stop.'),
  lng: z.number().describe('The longitude of the stop.'),
});

// Route schema for the output from the AI prompt
const AiRouteSchema = z.object({
    route_id: z.string().describe('The unique identifier for the route.'),
    routeName: z.string().describe('The name of the route.'),
    busType: z.string().describe('The type of bus for the route (e.g., Express, Deluxe).'),
    stops: z.array(z.string()).describe("An ordered list of stop names for the route."),
    totalDistance: z.number().describe('The total distance of the route in kilometers.'),
    totalTime: z.number().describe('The total estimated run time for the route in minutes.'),
});


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


export async function processAndStoreRoutes(input: ProcessRoutesInput): Promise<void> {
    const db = getFirestore(app);
    const stopsMap = new Map((await getStopsTool({city: input.city})).map(stop => [stop.stop_name, stop]));
    
    const { output: aiOutput } = await prompt(input);
    
    if (!aiOutput || !aiOutput.routes) {
        throw new Error("AI failed to process the route data. The model returned an empty response.");
    }
    
    const batch = writeBatch(db);
    const routesCollection = collection(db, 'routes');

    for (const route of aiOutput.routes) {
        const stopCoordinates = route.stops
            .map(stopName => {
                const stop = stopsMap.get(stopName);
                return stop ? { lat: stop.lat, lng: stop.lng } : null;
            })
            .filter((s): s is { lat: number; lng: number } => s !== null);

        // Generate the accurate path
        let pathResult = { path: stopCoordinates }; // Fallback to straight lines
        try {
            if (stopCoordinates.length > 1) {
                pathResult = await generatePath({ stops: stopCoordinates });
            }
        } catch(e) {
            console.error("Path generation failed for imported route, falling back to straight lines", e);
        }

        const docRef = doc(routesCollection); // Auto-generate ID
        batch.set(docRef, {
            ...route,
            path: pathResult.path,
            city: input.city,
        });
    }

    await batch.commit();
}

const prompt = ai.definePrompt({
  name: 'routeImporterPrompt',
  input: { schema: ProcessRoutesInputSchema },
  output: { schema: z.object({ routes: z.array(AiRouteSchema) }) },
  tools: [getStopsTool],
  prompt: `You are a data processing expert for a bus fleet in India. You will be given the content of a CSV file containing bus route information.
Your task is to parse this CSV content, identify distinct routes, and structure the data.

The CSV file has columns: route_id, route_name, stop_sequence, stop_name, distances_km, e_run_time, bus_type.

You must group the stops by 'route_id' and order them by the 'stop_sequence' number.
For each group, the 'route_name' and 'bus_type' will be the same.
The 'distances_km' and 'e_run_time' columns represent the value for each segment of the route. You need to sum these up for each distinct route to get the 'totalDistance' and 'totalTime'.

For each route, compile an ordered list of 'stop_name' based on 'stop_sequence'.

The 'city' for these routes is: {{{city}}}. You must use the getStops tool to look up the available stops for this city to validate the stop names. If a stop_name from the CSV does not exist in the tool's output, you must exclude it from the route's stop list.

The final output must be a JSON object containing a "routes" key, which is a list of route objects. Each object should have:
- route_id
- routeName
- busType
- stops (an array of stop names in order)
- totalDistance (sum for the route)
- totalTime (sum for the route)

Do NOT use any tools other than getStops. You are only responsible for parsing the CSV and structuring the route data. Path generation will happen later.

CSV Content:
{{{csvContent}}}
`,
});
