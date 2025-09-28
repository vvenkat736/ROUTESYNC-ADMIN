
'use server';
/**
 * @fileOverview An AI flow for optimizing a route between multiple points.
 *
 * - optimizeRoute - A function that takes a start point and a list of stops and returns an optimized route.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { geocodeLocation } from './geocode-flow';

const PointSchema = z.object({
  name: z.string().describe('The name or address of the location.'),
  lat: z.number().describe('The latitude of the location.'),
  lng: z.number().describe('The longitude of the location.'),
});

export const OptimizeRouteInputSchema = z.object({
  start: z.string().describe('The starting point of the route.'),
  stops: z.array(z.string()).describe('An array of destinations or stops.'),
});
export type OptimizeRouteInput = z.infer<typeof OptimizeRouteInputSchema>;

export const OptimizeRouteOutputSchema = z.object({
    start: PointSchema.describe("The starting point of the optimized route."),
    waypoints: z.array(PointSchema).describe('The optimized sequence of waypoints between the start and end.'),
    end: PointSchema.describe("The final destination of the optimized route."),
    totalTime: z.number().describe("The total estimated travel time in minutes."),
    totalDistance: z.number().describe("The total travel distance in kilometers."),
});
export type OptimizeRouteOutput = z.infer<typeof OptimizeRouteOutputSchema>;

const GeocodedStopsSchema = z.object({
  start: PointSchema,
  stops: z.array(PointSchema),
});

export async function optimizeRoute(input: OptimizeRouteInput): Promise<OptimizeRouteOutput> {
  const { start, stops } = input;
  
  if (stops.length === 0) {
    throw new Error("At least one destination is required.");
  }

  const allLocations = [start, ...stops];
  const geocodedLocations = await Promise.all(
    allLocations.map(location => geocodeLocation({ location }))
  );
  
  const geocodedStart = geocodedLocations[0];
  const geocodedStops = geocodedLocations.slice(1);

  return optimizeRouteFlow({ start: geocodedStart, stops: geocodedStops });
}

const prompt = ai.definePrompt({
  name: 'optimizeRoutePrompt',
  input: { schema: GeocodedStopsSchema },
  output: { schema: OptimizeRouteOutputSchema },
  prompt: `You are a highly intelligent route optimization expert for travel within India.
Your task is to determine the most efficient order to visit a series of stops, starting from a given point.

The user provides a starting point and a list of destinations. One of these destinations must be treated as the final stop in the sequence.
You need to reorder the other destinations to create the most logical and time-efficient route.

Starting Point: {{start.name}} (Lat: {{start.lat}}, Lng: {{start.lng}})

Destinations to visit:
{{#each stops}}
- {{name}} (Lat: {{lat}}, Lng: {{lng}})
{{/each}}

Based on real-world road networks and traffic patterns in India, determine the optimal sequence.
Your final output MUST designate one of the provided destinations as the 'end' point. The remaining destinations should be ordered as 'waypoints'.

You must also estimate the total travel time in minutes and total distance in kilometers for the entire journey.
Assume an average travel speed of 30 km/h within cities and 50 km/h on highways.

Return a JSON object with the start point, the ordered waypoints, the end point, the totalTime, and the totalDistance.
`,
});

const optimizeRouteFlow = ai.defineFlow(
  {
    name: 'optimizeRouteFlow',
    inputSchema: GeocodedStopsSchema,
    outputSchema: OptimizeRouteOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("AI failed to optimize the route. The model returned an empty response.");
    }
    return output;
  }
);
