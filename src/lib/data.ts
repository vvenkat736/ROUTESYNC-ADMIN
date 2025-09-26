
export type Bus = {
  id: string; // Changed to string to match firestore doc id
  busNumber: string;
  driver: string;
  driverAvatar: string;
  route: number;
  status: 'Active' | 'Delayed' | 'Inactive';
  lat: number;
  lng: number;
};

export type Route = {
    id: number;
    stops: number;
    frequency: string;
    path: [number, number][];
};


export const buses: Omit<Bus, 'id'>[] = [
  { busNumber: 'TN 37 C 1234', driver: 'M. Kumar', driverAvatar: '1', route: 101, status: 'Active', lat: 10.79861, lng: 78.68041 },
  { busNumber: 'TN 38 A 5678', driver: 'S. Priya', driverAvatar: '2', route: 102, status: 'Active', lat: 10.83178, lng: 78.69323 },
  { busNumber: 'TN 37 D 9012', driver: 'R. Suresh', driverAvatar: '3', route: 103, status: 'Delayed', lat: 10.82577, lng: 78.68337 },
  { busNumber: 'TN 38 B 3456', driver: 'K. Anitha', driverAvatar: '4', route: 101, status: 'Active', lat: 10.824, lng: 78.6815 },
  { busNumber: 'TN 37 E 7890', driver: 'V. Arun', driverAvatar: '5', route: 104, status: 'Inactive', lat: 10.80009, lng: 78.68786 },
  { busNumber: 'TN 38 F 1230', driver: 'L. Meena', driverAvatar: '6', route: 102, status: 'Active', lat: 10.80783, lng: 78.69416 },
  { busNumber: 'TN 37 G 4567', driver: 'P. Rajan', driverAvatar: '7', route: 105, status: 'Delayed', lat: 10.79, lng: 78.72 },
  { busNumber: 'TN 38 H 8901', driver: 'G. Devi', driverAvatar: '8', route: 103, status: 'Active', lat: 10.7855, lng: 78.7175 },
];

export const routes: Route[] = [
    { 
      id: 101, 
      stops: 15, 
      frequency: '20 mins',
      path: [
        [10.850, 78.683], // Srirangam
        [10.830, 78.686], // Amma Mandapam
        [10.825, 78.683], // Chatram Bus Stand
        [10.809, 78.684], // Main Guard Gate
        [10.798, 78.680], // Central Bus Stand
      ]
    },
    { 
      id: 102, 
      stops: 22, 
      frequency: '15 mins',
      path: [
        [10.798, 78.680], // Central Bus Stand
        [10.788, 78.690], // Railway Junction
        [10.795, 78.705], // Golden Rock
        [10.808, 78.720], // Airport
        [10.830, 78.710], // SIT
      ]
    },
    { 
      id: 103, 
      stops: 18, 
      frequency: '25 mins',
      path: [
        [10.825, 78.683], // Chatram Bus Stand
        [10.840, 78.670], // Thillai Nagar
        [10.855, 78.665], // Karur Bypass Road
        [10.860, 78.690], // No 1 Tolgate
        [10.850, 78.683], // Srirangam
      ]
    },
    { 
      id: 104, 
      stops: 12, 
      frequency: '30 mins',
      path: [
        [10.798, 78.680], // Central Bus Stand
        [10.760, 78.675], // Crawford
        [10.750, 78.695], // K.K. Nagar
        [10.770, 78.710], // Panjapur
        [10.790, 78.720], // Airport
      ]
    },
    { 
      id: 105, 
      stops: 25, 
      frequency: '18 mins',
      path: [
        [10.825, 78.683], // Chatram Bus Stand
        [10.810, 78.695], // St. Joseph's College
        [10.800, 78.715], // Palpannai
        [10.785, 78.730], // Thiruverumbur
        [10.770, 78.750], // BHEL Township
      ]
    },
];

export const alerts = [
  { type: 'SOS', busNumber: 'TN 37 D 9012', message: 'Mechanical issue reported.' },
  { type: 'Delayed', busNumber: 'TN 37 G 4567', message: 'Heavy traffic on Gandhipuram flyover.' },
  { type: 'Inactive', busNumber: 'TN 37 E 7890', message: 'Bus offline for 30 minutes.' },
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
  { route: '101', delays: 5 },
  { route: '102', delays: 8 },
  { route: '103', delays: 12 },
  { route: '104', delays: 3 },
  { route: '105', delays: 15 },
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
