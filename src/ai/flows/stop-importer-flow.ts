
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
    // Add more robust check
    if (!output || !output.stops || !Array.isArray(output.stops) || output.stops.length === 0) {
        throw new Error("AI failed to process the stop data. The model returned an empty or invalid response. Please check the CSV file format and try again.");
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
  prompt: `You are a highly accurate data processing expert for a public transit system in India.
Your task is to parse CSV content containing bus stop information and convert it into a structured JSON object.

You must be resilient to common issues like extra whitespace, empty lines, or additional columns that are not part of the schema.
The required columns are: stop_id, stop_name, lat, lng, note. You must parse each row into a JSON object matching the defined schema.
Ensure that 'lat' and 'lng' are always converted to numbers. If a 'note' is not provided, it should be omitted or be an empty string.

The 'city' for these stops is: {{{city}}}.

Example:
Input CSV Content:
"stop_id","stop_name","lat","lng","note"
"S01","Central Bus Stand","10.79861","78.68041","Main hub"
"S02","Chathiram","10.83178","78.69323",""

Expected JSON Output:
{
  "stops": [
    {
      "stop_id": "S01",
      "stop_name": "Central Bus Stand",
      "lat": 10.79861,
      "lng": 78.68041,
      "note": "Main hub"
    },
    {
      "stop_id": "S02",
      "stop_name": "Chathiram",
      "lat": 10.83178,
      "lng": 78.69323,
      "note": ""
    }
  ]
}

The final output MUST be a JSON object containing a "stops" key, which is a list of stop objects.

Here is the CSV content to process:
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
