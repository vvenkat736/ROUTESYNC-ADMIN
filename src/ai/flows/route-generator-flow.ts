
'use server';
/**
 * @fileOverview An AI flow for automatically generating bus routes from a list of stops.
 *
 * - generateRoutes - A function that fetches all stops and asks the AI to create logical routes.
 * - GenerateRoutesOutput - The return type for the generateRoutes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

// Schema for a single point in a route's path
const PointSchema = z.object({
  lat: z.number().describe('The latitude of the stop.'),
  lng: z.number().describe('The longitude of the stop.'),
});

// Schema for a single generated route
const GeneratedRouteSchema = z.object({
    routeName: z.string().describe("A descriptive name for the route (e.g., 'Central Bus Stand to Srirangam')."),
    busType: z.string().describe('The type of bus for the route (e.g., Express, Deluxe, Standard).'),
    stops: z.array(z.string()).describe('An ordered list of stop names that make up the route.'),
    path: z.array(PointSchema).describe('An ordered array of coordinates representing the entire route path.'),
    totalDistance: z.number().describe('The total distance of the route in kilometers.'),
    totalTime: z.number().describe('The total estimated run time for the route in minutes.'),
});

// The final output schema containing a list of generated routes
const GenerateRoutesOutputSchema = z.object({
  routes: z.array(GeneratedRouteSchema),
});
export type GenerateRoutesOutput = z.infer<typeof GenerateRoutesOutputSchema>;

// Helper function to get all available bus stops from Firestore
async function getStops() {
    const db = getFirestore(app);
    const stopsCollection = collection(db, 'stops');
    const snapshot = await getDocs(stopsCollection);
    return snapshot.docs.map(doc => ({ stop_id: doc.id, ...doc.data() } as any));
}

// The main exported function that the UI will call
export async function generateRoutes(): Promise<GenerateRoutesOutput> {
  return generateRoutesFlow();
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
  input: { schema: z.object({ stops: z.array(StopInfoSchema) }) },
  output: { schema: GenerateRoutesOutputSchema },
  prompt: `You are a master transport logistics expert for the city of Trichy, India.
Your task is to create a set of logical and efficient bus routes that connect the available bus stops provided to you.

Based on the list of stops below, you will create between 5 and 8 distinct bus routes. Each route should cover a logical area or connect important hubs (like 'Central Bus Stand', 'Chathiram', 'Srirangam', 'Thiruverumbur').

Available Stops:
{{#each stops}}
- {{stop_name}} (Lat: {{lat}}, Lng: {{lng}})
{{/each}}


For each route you generate, you must provide:
1.  A descriptive 'routeName' (e.g., 'Central Bus Stand to Thiruverumbur').
2.  A 'busType' (either 'Express', 'Deluxe', or 'Standard').
3.  An ordered list of 'stops' (the stop names). The order is critical and must represent a sensible path.
4.  An ordered 'path' of geographic coordinates corresponding to the sequence of stops.
5.  An estimated 'totalDistance' in kilometers for the entire route.
6.  An estimated 'totalTime' in minutes for the entire route.

The final output must be a JSON object conforming to the required schema, containing a single key "routes" which is a list of the routes you have created.
`,
});


const generateRoutesFlow = ai.defineFlow(
  {
    name: 'generateRoutesFlow',
    outputSchema: GenerateRoutesOutputSchema,
  },
  async () => {
    // Step 1: Explicitly fetch the stops first.
    const stops = await getStops();

    if (!stops || stops.length === 0) {
      throw new Error("No stops found in the database. Please import stops first.");
    }
    
    // Step 2: Pass the fetched stops to the AI.
    const { output } = await prompt({ stops });

    if (!output) {
      throw new Error("AI failed to generate routes. The model returned an empty response.");
    }
    return output;
  }
);
