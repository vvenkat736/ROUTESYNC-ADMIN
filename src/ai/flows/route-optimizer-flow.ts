
'use server';
/**
 * @fileOverview An AI flow for optimizing a route between multiple points.
 *
 * - optimizeRoute - A function that takes a start point and a list of stops and returns an optimized route.
 * - OptimizeRouteInput - The input type for the optimizeRoute function.
 * - OptimizeRouteOutput - The return type for the optimizeRoute function.
 */

import { z } from 'genkit';
import { geocodeLocation, GeocodeOutput } from './geocode-flow';

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


// Haversine distance calculation
function getDistance(p1: GeocodeOutput, p2: GeocodeOutput): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


export async function optimizeRoute(input: OptimizeRouteInput): Promise<OptimizeRouteOutput> {
  const { start, stops } = input;
  const averageSpeedKmh = 30; // Average speed for ETA calculation

  if (stops.length === 0) {
    throw new Error("At least one destination is required.");
  }
  
  // Geocode all locations in parallel
  const allLocations = [start, ...stops];
  const geocodedLocations = await Promise.all(
    allLocations.map(location => geocodeLocation({ location }))
  );

  const startPoint = geocodedLocations[0];
  const endPoint = geocodedLocations[geocodedLocations.length - 1];
  let waypointsToVisit = geocodedLocations.slice(1, -1);
  
  const optimizedWaypoints: GeocodeOutput[] = [];
  let totalDistance = 0;
  let currentPoint = startPoint;

  // Nearest neighbor algorithm
  while (waypointsToVisit.length > 0) {
    let nearestIndex = -1;
    let minDistance = Infinity;

    waypointsToVisit.forEach((point, index) => {
      const distance = getDistance(currentPoint, point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });
    
    const nearestPoint = waypointsToVisit[nearestIndex];
    optimizedWaypoints.push(nearestPoint);
    totalDistance += minDistance;
    currentPoint = nearestPoint;
    waypointsToVisit.splice(nearestIndex, 1);
  }

  // Add distance from last waypoint to the end point
  totalDistance += getDistance(currentPoint, endPoint);

  const totalTime = Math.round((totalDistance / averageSpeedKmh) * 60);

  return {
    start: startPoint,
    waypoints: optimizedWaypoints,
    end: endPoint,
    totalTime,
    totalDistance: parseFloat(totalDistance.toFixed(2)),
  };
}
