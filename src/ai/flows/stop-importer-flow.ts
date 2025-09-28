
'use server';
/**
 * @fileOverview An AI flow for processing and storing bus stops from a CSV file.
 *
 * - processAndStoreStops - A function that takes CSV content, parses it, and stores it in Firestore.
 * - ProcessStopsInput - The input type for the processAndStoreStops function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';
import { app } from '@/lib/firebase';

// Define the input schema for the flow
const ProcessStopsInputSchema = z.object({
  csvContent: z.string().describe('The full content of the CSV file containing stop data.'),
  city: z.string().describe('The city these stops belong to.'),
});
export type ProcessStopsInput = z.infer<typeof ProcessStopsInputSchema>;

// Schema for a single stop parsed by the AI
const AiStopSchema = z.object({
    stop_id: z.string().describe("The unique identifier for the stop (e.g., 'S01', 'T02')."),
    stop_name: z.string().describe('The public name of the bus stop.'),
    lat: z.number().describe('The latitude of the stop.'),
    lng: z.number().describe('The longitude of the stop.'),
    note: z.string().optional().describe('Any additional notes for the stop.'),
});

// The main exported function that the UI will call
export async function processAndStoreStops(input: ProcessStopsInput): Promise<{ count: number }> {
    const { output } = await processStopsFlow(input);
    if (!output || !output.stops) {
        throw new Error("AI failed to process the stop data. The model returned an empty response.");
    }
    
    const db = getFirestore(app);
    const batch = writeBatch(db);
    const stopsCollection = collection(db, 'stops');
    
    output.stops.forEach(stop => {
        const docRef = doc(stopsCollection, stop.stop_id);
        batch.set(docRef, {
            ...stop,
            city: input.city,
        });
    });

    await batch.commit();

    return { count: output.stops.length };
}


// Define the prompt for the AI model
const processStopsPrompt = ai.definePrompt({
  name: 'stopImporterPrompt',
  input: { schema: ProcessStopsInputSchema },
  output: { schema: z.object({ stops: z.array(AiStopSchema) }) },
  prompt: `You are a data processing expert for a bus fleet in India. You will be given the content of a CSV file containing bus stop information.
Your task is to parse this CSV content and structure the data into a JSON format.

The CSV file has the following columns: stop_id, stop_name, lat, lng, note.

You must parse each row of the CSV into a structured JSON object. Ensure that 'lat' and 'lng' are converted to numbers.

The 'city' for these stops is: {{{city}}}.

The final output must be a JSON object containing a "stops" key, which is a list of stop objects.

CSV Content:
{{{csvContent}}}
`,
});

// Define the Genkit flow
const processStopsFlow = ai.defineFlow(
  {
    name: 'processStopsFlow',
    inputSchema: ProcessStopsInputSchema,
    outputSchema: z.object({
        stops: z.array(AiStopSchema),
    }),
  },
  async (input) => {
    const { output } = await processStopsPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate a response for the stops CSV.");
    }
    return output;
  }
);
