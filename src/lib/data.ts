
export type Bus = {
  id: string; // Firestore doc id
  busNumber: string;
  driver: string;
  route: string; // route_id
  status: 'Active' | 'Delayed' | 'Inactive';
  lat: number;
  lng: number;
  city: string;
  occupancy: 'Empty' | 'Half-Full' | 'Full' | 'Overcrowded';
  nextStop: string;
  nextStopETA: number; // in minutes
};

export type Route = {
  id: string; // Firestore doc id
  route_id: string; // Keep a separate route identifier if needed
  routeName: string;
  busType: string;
  stops: string[]; // Array of stop names
  path: { lat: number; lng: number; }[]; // Array of coordinates for the full path
  totalDistance: number;
  totalTime: number;
  city: string;
};


export type Stop = {
  stop_id: string;
  stop_name: string;
  lat: number;
  lng: number;
  note: string;
  city: string;
};

// Static data for charts - not intended to be in Firestore
export const alerts = [
  { id: 'alert_1', type: 'SOS', busNumber: 'TN 45 D 9012', message: 'Mechanical issue reported.', timestamp: new Date() },
  { id: 'alert_2', type: 'Delayed', busNumber: 'TN 45 G 4567', message: 'Heavy traffic on Gandhipuram flyover.', timestamp: new Date() },
  { id: 'alert_3', type: 'Inactive', busNumber: 'TN 33 B 4444', message: 'Bus offline for 30 minutes.', timestamp: new Date() },
  { id: 'alert_4', type: 'Delayed', busNumber: 'TN 30 E 5555', message: 'Tyre puncture reported.', timestamp: new Date() },
];

export const tripsPerDayData = [
  { day: 'Mon', trips: 220 },
  { day: 'Tue', trips: 250 },
  { day: 'Wed', trips: 230 },
  { day: 'Thu', trips: 260 },
  { day: 'Fri', trips: 290 },
  { day: 'Sat', trips: 320 },
  { day: 'Sun', trips: 280 },
];

export const delaysPerRouteData = [
  { route: 'R01', delays: 5 },
  { route: 'R02', delays: 8 },
  { route: 'R03', delays: 12 },
  { route: 'R04', delays: 3 },
  { route: 'R05', delays: 15 },
];

export const busStatusData = (buses: Bus[]) => [
    { name: 'Active', value: buses.filter(b => b.status === 'Active').length, color: 'emerald' },
    { name: 'Delayed', value: buses.filter(b => b.status === 'Delayed').length, color: 'amber' },
    { name: 'Inactive', value: buses.filter(b => b.status === 'Inactive').length, color: 'slate' },
];

export const carbonFootprintData = [
    { name: 'Jan', fleet: 400, cars: 2400 },
    { name: 'Feb', fleet: 300, cars: 1398 },
    { name: 'Mar', fleet: 200, cars: 9800 },
    { name: 'Apr', fleet: 278, cars: 3908 },
    { name: 'May', fleet: 189, cars: 4800 },
];
