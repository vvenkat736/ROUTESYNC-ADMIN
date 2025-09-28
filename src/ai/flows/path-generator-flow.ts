
'use server';
/**
 * @fileOverview An AI flow for generating a road-accurate path between a series of points.
 *
 * - generatePath - Takes a list of coordinates and returns a detailed polyline path.
 * - GeneratePathInput - Input schema for the flow.
 * - GeneratePathOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema for a single point (latitude and longitude)
const PointSchema = z.object({
  lat: z.number().describe('The latitude of the point.'),
  lng: z.number().describe('The longitude of the point.'),
});

// Input schema: a list of stops to connect
export const GeneratePathInputSchema = z.object({
  stops: z.array(PointSchema).describe('An ordered list of stops (points) to connect with a road path.'),
});
export type GeneratePathInput = z.infer<typeof GeneratePathInputSchema>;

// Output schema: a single, detailed path
export const GeneratePathOutputSchema = z.object({
  path: z.array(PointSchema).describe('An ordered array of coordinates representing the entire road path.'),
});
export type GeneratePathOutput = z.infer<typeof GeneratePathOutputSchema>;


export async function generatePath(input: GeneratePathInput): Promise<GeneratePathOutput> {
  return generatePathFlow(input);
}


const prompt = ai.definePrompt({
  name: 'pathGeneratorPrompt',
  input: { schema: GeneratePathInputSchema },
  output: { schema: GeneratePathOutputSchema },
  prompt: `You are a master cartographer and route planning expert.
Your task is to generate a detailed, road-accurate path that connects the given sequence of stops.

The path you generate should not be a straight line between the points. It must follow the real-world road network. The output should be a polyline, which is an array of many small coordinate points that trace the roads.

Generate a path that connects the following stops in order:
{{#each stops}}
- Stop: (Lat: {{lat}}, Lng: {{lng}})
{{/each}}

The final output must be a JSON object containing a "path" key, which is the array of coordinates.
`,
});


const generatePathFlow = ai.defineFlow(
  {
    name: 'generatePathFlow',
    inputSchema: GeneratePathInputSchema,
    outputSchema: GeneratePathOutputSchema,
  },
  async (input) => {
    if (input.stops.length < 2) {
      return { path: input.stops };
    }
    
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error("AI failed to generate a path. The model returned an empty response.");
    }
    return output;
  }
);
