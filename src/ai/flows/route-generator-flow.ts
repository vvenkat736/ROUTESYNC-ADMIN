
'use server';
/**
 * @fileOverview An algorithmic flow for generating bus routes from a list of stops using k-means clustering.
 *
 * - generateRoutes - A function that fetches all stops, clusters them, and creates routes.
 */
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { generatePath } from './path-generator-flow';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { kmeans } from 'node-kmeans';

type Point = {
  lat: number;
  lng: number;
};

export type GenerateRoutesOutput = {
  routes: {
    route_id: string;
    routeName: string;
    busType: string;
    stops: string[];
    path: Point[];
    totalDistance: number;
    totalTime: number;
  }[];
};

type StopInfo = {
    stop_id: string;
    stop_name: string;
    lat: number;
    lng: number;
};

// Calculates the haversine distance between two points in kilometers.
function getDistance(p1: Point, p2: Point) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


// Uses a nearest-neighbor approach to create an ordered path from a set of stops.
function orderStops(stops: StopInfo[]): StopInfo[] {
    if (stops.length < 2) return stops;
  
    const remainingStops = [...stops];
    const orderedRoute: StopInfo[] = [];
    
    // Find the northernmost stop to start with
    let currentStop = remainingStops.reduce((prev, curr) => (prev.lat > curr.lat ? prev : curr));
    orderedRoute.push(currentStop);
    
    let currentIdx = remainingStops.findIndex(s => s.stop_id === currentStop.stop_id);
    remainingStops.splice(currentIdx, 1);
  
    while (remainingStops.length > 0) {
      let nearestNeighbor: StopInfo | null = null;
      let minDistance = Infinity;
      let nearestIdx = -1;
  
      remainingStops.forEach((neighbor, index) => {
        const distance = getDistance(currentStop, neighbor);
        if (distance < minDistance) {
          minDistance = distance;
          nearestNeighbor = neighbor;
          nearestIdx = index;
        }
      });
  
      if (nearestNeighbor) {
        currentStop = nearestNeighbor;
        orderedRoute.push(currentStop);
        remainingStops.splice(nearestIdx, 1);
      }
    }
  
    return orderedRoute;
}

export const getStopsTool = ai.defineTool(
    {
      name: 'getStops',
      description: 'Get the list of all available bus stops and their locations for a specific city.',
      inputSchema: z.object({ city: z.string() }),
      outputSchema: z.array(z.object({
          stop_id: z.string(),
          stop_name: z.string(),
          lat: z.number(),
          lng: z.number(),
      })),
    },
    async ({city}) => {
        const db = getFirestore(app);
        const q = query(collection(db, "stops"), where("city", "==", city));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                stop_id: doc.id,
                ...data,
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng),
            } as any;
        });
    }
);


async function getStopsForCity(city: string): Promise<StopInfo[]> {
    const stops = await getStopsTool({city});
    return stops.map(s => ({
        ...s,
        lat: Number(s.lat),
        lng: Number(s.lng)
    })) as StopInfo[];
}


async function createAlgorithmicRoutes(stops: StopInfo[], city: string): Promise<GenerateRoutesOutput> {
    if (stops.length < 2) {
      throw new Error("At least 2 stops must be present to generate routes. Please import more stops.");
    }
  
    // 1. Prepare data for k-means
    const vectors = stops.map(stop => [stop.lat, stop.lng]);
    const numClusters = Math.min(7, Math.floor(stops.length / 2)); 
  
    if (numClusters < 1) {
        throw new Error("Not enough stops to form even one route.");
    }

    // 2. Run k-means clustering
    const kMeansResult = await new Promise<any[]>((resolve, reject) => {
      kmeans.clusterize(vectors, { k: numClusters }, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
    
    const clusters: { [key: number]: StopInfo[] } = {};
    kMeansResult.forEach(cluster => {
        clusters[cluster.clusterInd] = cluster.cluster.map((vector: number[]) => 
            stops.find(s => s.lat === vector[0] && s.lng === vector[1])!
        ).filter(Boolean);
    });
    
    // 3. Handle outliers/unassigned stops
    const assignedStops = new Set<string>();
    Object.values(clusters).forEach(clusterStops => 
        clusterStops.forEach(stop => assignedStops.add(stop.stop_id))
    );

    const unassignedStops = stops.filter(stop => !assignedStops.has(stop.stop_id));

    if (unassignedStops.length > 0) {
        unassignedStops.forEach(outlier => {
            let nearestClusterIndex = -1;
            let minDistance = Infinity;

            kMeansResult.forEach((cluster, index) => {
                const distance = getDistance(outlier, { lat: cluster.centroid[0], lng: cluster.centroid[1] });
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestClusterIndex = index;
                }
            });

            if (nearestClusterIndex !== -1) {
                clusters[nearestClusterIndex].push(outlier);
            }
        });
    }


    // 4. Create routes from clusters
    const generatedRoutes = Object.values(clusters).map((clusterStops, index) => {
      if (clusterStops.length < 2) return null;
      
      const orderedClusterStops = orderStops(clusterStops);
      const firstStop = orderedClusterStops[0];
      const lastStop = orderedClusterStops[orderedClusterStops.length - 1];
      
      let totalDistance = 0;
      for (let i = 0; i < orderedClusterStops.length - 1; i++) {
        totalDistance += getDistance(orderedClusterStops[i], orderedClusterStops[i + 1]);
      }

      const totalTime = Math.round(totalDistance / (20 / 60)); // Avg speed 20km/h

      return {
        route_id: `R-${city.substring(0,2).toUpperCase()}-${index + 1}`,
        routeName: `${firstStop.stop_name} to ${lastStop.stop_name}`,
        busType: ['Express', 'Deluxe', 'Standard'][index % 3],
        stops: orderedClusterStops.map(s => s.stop_name),
        stopCoordinates: orderedClusterStops.map(s => ({ lat: s.lat, lng: s.lng })),
        totalDistance: totalDistance,
        totalTime: totalTime,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  
    // 5. Generate road-accurate paths for each route
    const finalRoutes = await Promise.all(
      generatedRoutes.map(async (route) => {
        let pathResult: { path: Point[] } = { path: [] };
        if (route.stopCoordinates.length > 1) {
          try {
            pathResult = await generatePath({ stops: route.stopCoordinates });
          } catch (error) {
             console.error(`Failed to generate path for route ${route.routeName}. Falling back to straight lines.`, error);
             pathResult = { path: route.stopCoordinates };
          }
        } else {
            pathResult = { path: route.stopCoordinates };
        }
  
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { stopCoordinates, ...finalRoute } = route;
        return {
          ...finalRoute,
          path: pathResult.path,
        };
      })
    );
  
    return { routes: finalRoutes };
}

// The main exported function that the UI will call
export async function generateRoutes(city: string): Promise<GenerateRoutesOutput> {
  try {
    const stops = await getStopsForCity(city);
    return await createAlgorithmicRoutes(stops, city);
  } catch (error: any) {
    if (error.message && error.message.includes('Service Unavailable')) {
      throw new Error("The route generation service is temporarily unavailable. Please try again in a few moments.");
    }
    throw error;
  }
}

// Define the flow for Genkit inspection if needed, but the logic is now algorithmic.
const generateRoutesFlow = ai.defineFlow(
    {
        name: 'generateRoutesFlow',
        inputSchema: z.object({ city: z.string() }),
        outputSchema: z.custom<GenerateRoutesOutput>(),
    },
    async ({ city }) => {
        const stops = await getStopsForCity(city);
        return await createAlgorithmicRoutes(stops, city);
    }
);
