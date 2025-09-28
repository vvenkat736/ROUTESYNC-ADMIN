
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
   city: z.string().optional().describe('An optional city name to provide context and improve accuracy (e.g., "Trichy").')
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
  prompt: `You are a highly accurate geocoding expert specializing in locations within India.
Your task is to find the precise geographic coordinates (latitude and longitude) for the given location query.

You must be resilient to common spelling mistakes and abbreviations. If a query is ambiguous, use the provided city context to find the most plausible result.

Location Query: {{{location}}}
{{#if city}}
City Context: {{{city}}}, India
{{/if}}

First, try to find the location within the provided city context. If no city is provided or if the location isn't found there, search more broadly within India.

Return the canonical name and the coordinates of the most likely location.`,
});

const geocodeFlow = ai.defineFlow(
  {
    name: 'geocodeFlow',
    inputSchema: GeocodeInputSchema,
    outputSchema: GeocodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.lat || !output.lng) {
        throw new Error("AI failed to geocode location. The model could not find a valid coordinate for the given query. Please try being more specific.");
    }
    return output;
  }
);

    
