
'use server';
/**
 * @fileOverview An AI flow for processing and storing bus routes from a CSV file.
 *
 * - processAndStoreRoutes - A function that takes CSV content, parses it, and stores it in Firestore.
 * - ProcessRoutesInput - The input type for the processAndStoreRoutes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

// Define the input schema for the flow
const ProcessRoutesInputSchema = z.object({
  csvContent: z.string().describe('The full content of the CSV file.'),
});
export type ProcessRoutesInput = z.infer<typeof ProcessRoutesInputSchema>;

// Point schema for geographic coordinates
const PointSchema = z.object({
  lat: z.number().describe('The latitude of the stop.'),
  lng: z.number().describe('The longitude of the stop.'),
});

// Route schema for the output
const RouteSchema = z.object({
    id: z.number().describe('The unique identifier for the route.'),
    stops: z.number().describe('The number of stops in the route.'),
    path: z.array(PointSchema).describe('An array of coordinates representing the route path.'),
});

// Output schema containing a list of routes
const ProcessRoutesOutputSchema = z.object({
  routes: z.array(RouteSchema),
});


const getStops = ai.defineTool(
    {
      name: 'getStops',
      description: 'Get the list of all available bus stops and their locations.',
      outputSchema: z.array(z.object({
          stop_id: z.string(),
          stop_name: z.string(),
          lat: z.number(),
          lng: z.number(),
      })),
    },
    async () => {
        const db = getFirestore(app);
        const stopsCollection = collection(db, 'stops');
        const snapshot = await getDocs(stopsCollection);
        return snapshot.docs.map(doc => ({ stop_id: doc.id, ...doc.data() } as any));
    }
);


export async function processAndStoreRoutes(input: ProcessRoutesInput): Promise<void> {
  // Directly call the prompt and handle potential null output here
  const { output } = await prompt(input);
  
  if (output && output.routes) {
    const db = getFirestore(app);
    const batch = writeBatch(db);
    const routesCollection = collection(db, 'routes');

    output.routes.forEach(route => {
      const docRef = doc(routesCollection, String(route.id));
      const { id, ...routeData } = route;
      batch.set(docRef, routeData);
    });

    await batch.commit();
  } else {
    // This will now be caught correctly
    throw new Error("AI failed to process the route data. The model returned an empty response.");
  }
}

const prompt = ai.definePrompt({
  name: 'routeImporterPrompt',
  input: { schema: ProcessRoutesInputSchema },
  output: { schema: ProcessRoutesOutputSchema },
  tools: [getStops],
  prompt: `You are a data processing expert for a bus fleet in India. You will be given the content of a CSV file containing bus route information.
Your task is to parse this CSV content, and construct the route paths.
The CSV file has the following columns: RouteID,StopName,Sequence.

You must group the stops by RouteID and order them by the Sequence number.
For each StopName in the CSV, you must use the getStops tool to find its exact geographic coordinates (latitude and longitude). The tool will provide a list of all known stops and their locations. Match the StopName from the CSV with the stop_name from the tool's output to find the coordinates.

After finding the coordinates for all stops in a route, construct a path for each route as an array of coordinates in the correct sequence. The 'stops' field in the output should be the count of stops for that route.

The final output must be a JSON object containing a list of routes, conforming to the required schema.

CSV Content:
{{{csvContent}}}
`,
});

// The flow can be simplified or used for more complex logic later if needed.
// For now, the main logic is in processAndStoreRoutes.
const routeImporterFlow = ai.defineFlow(
  {
    name: 'routeImporterFlow',
    inputSchema: ProcessRoutesInputSchema,
    outputSchema: ProcessRoutesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI model failed to return a valid output.");
    }
    return output;
  }
);
