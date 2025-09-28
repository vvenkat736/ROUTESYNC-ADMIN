
'use server';
/**
 * @fileOverview An AI flow for geocoding a location string into coordinates.
 *
 * - geocodeLocation - Takes a location name and returns its lat/lng.
 * - GeocodeInput - Input schema for the flow.
 * - GeocodeOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeocodeInputSchema = z.object({
  location: z.string().describe('The name of the location to geocode (e.g., "Eiffel Tower, Paris").'),
});
export type GeocodeInput = z.infer<typeof GeocodeInputSchema>;

const GeocodeOutputSchema = z.object({
  name: z.string().describe('The canonical name of the location found.'),
  lat: z.number().describe('The latitude of the location.'),
  lng: z.number().describe('The longitude of the location.'),
});
export type GeocodeOutput = z.infer<typeof GeocodeOutputSchema>;

export async function geocodeLocation(input: GeocodeInput): Promise<GeocodeOutput> {
  return geocodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'geocodePrompt',
  input: { schema: GeocodeInputSchema },
  output: { schema: GeocodeOutputSchema },
  prompt: `You are a highly accurate geocoding assistant.
Your task is to find the precise geographic coordinates (latitude and longitude) for the given location.

Location: {{{location}}}

Return the canonical name and the coordinates.`,
});

const geocodeFlow = ai.defineFlow(
  {
    name: 'geocodeFlow',
    inputSchema: GeocodeInputSchema,
    outputSchema: GeocodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("AI failed to geocode location. The model returned an empty response.");
    }
    return output;
  }
);

    
