
'use server';
/**
 * @fileOverview An AI flow for processing and storing bus routes from a CSV file.
 *
 * - processAndStoreRoutes - A function that takes CSV content, parses it, and stores it in Firestore.
 * - ProcessRoutesInput - The input type for the processAndStoreRoutes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';
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


export async function processAndStoreRoutes(input: ProcessRoutesInput): Promise<void> {
  const result = await routeImporterFlow(input);
  
  if (result && result.routes) {
    const db = getFirestore(app);
    const batch = writeBatch(db);
    const routesCollection = collection(db, 'routes');

    result.routes.forEach(route => {
      const docRef = doc(routesCollection, String(route.id));
      const { id, ...routeData } = route;
      batch.set(docRef, routeData);
    });

    await batch.commit();
  }
}

const prompt = ai.definePrompt({
  name: 'routeImporterPrompt',
  input: { schema: ProcessRoutesInputSchema },
  output: { schema: ProcessRoutesOutputSchema },
  prompt: `You are a data processing expert. You will be given the content of a CSV file containing bus route information.
Your task is to parse this CSV content, determine the geographic coordinates (latitude and longitude) for each stop, and structure the data.
The CSV file has the following columns: RouteID,StopName,Sequence.

You need to group the stops by RouteID and order them by the Sequence number.
Then, for each stop name, find its geographic coordinates.
Finally, construct a path for each route as an array of coordinates.

The output must be a JSON object containing a list of routes.

CSV Content:
{{{csvContent}}}
`,
});

const routeImporterFlow = ai.defineFlow(
  {
    name: 'routeImporterFlow',
    inputSchema: ProcessRoutesInputSchema,
    outputSchema: ProcessRoutesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
