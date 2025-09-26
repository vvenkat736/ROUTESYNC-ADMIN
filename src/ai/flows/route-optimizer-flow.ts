'use server';
/**
 * @fileOverview An AI flow for optimizing a route between multiple points.
 *
 * - optimizeRoute - A function that takes a start point and a list of stops and returns an optimized route.
 * - OptimizeRouteInput - The input type for the optimizeRoute function.
 * - OptimizeRouteOutput - The return type for the optimizeRoute function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

export async function optimizeRoute(input: OptimizeRouteInput): Promise<OptimizeRouteOutput> {
  return optimizeRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeRoutePrompt',
  input: { schema: OptimizeRouteInputSchema },
  output: { schema: OptimizeRouteOutputSchema },
  prompt: `You are a route optimization expert for a bus fleet in India. Your task is to determine the most efficient route given a starting point and a list of stops.

You must determine the geographic coordinates (latitude and longitude) for each given location name.

The output should be a structured JSON object that includes the optimized order of waypoints, the total estimated travel time in minutes, and the total distance in kilometers.

The start point is: {{{start}}}
The stops are:
{{#each stops}}
- {{{this}}}
{{/each}}

Please provide the most optimal route. The first stop in the waypoints array should be the first destination after the start point. The last stop in the waypoints array will be the one visited just before the final end point. The final stop from the user input should be the 'end' point in your output.`,
});

const optimizeRouteFlow = ai.defineFlow(
  {
    name: 'optimizeRouteFlow',
    inputSchema: OptimizeRouteInputSchema,
    outputSchema: OptimizeRouteOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
