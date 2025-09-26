
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
    id: string; // Firestore doc id
    route_id: number;
    route_name: string;
    stop_sequence: number;
    stop_name: string;
    distances_km: number;
    e_run_time: number;
    bus_type: string;
};

export type Stop = {
  stop_id: string;
  stop_name: string;
  lat: number;
  lng: number;
  note: string;
};

export const stops: Stop[] = [
  { stop_id: 'S01', stop_name: 'Central Bus Stand', lat: 10.79861, lng: 78.68041, note: 'sourced/approx' },
  { stop_id: 'S02', stop_name: 'Chathiram', lat: 10.83178, lng: 78.69323, note: 'sourced/approx' },
  { stop_id: 'S03', stop_name: 'Thillai Nagar', lat: 10.82577, lng: 78.68337, note: 'sourced/approx' },
  { stop_id: 'S04', stop_name: 'Sastri Road', lat: 10.824, lng: 78.6815, note: 'approx' },
  { stop_id: 'S05', stop_name: 'Heber Road', lat: 10.80009, lng: 78.68786, note: 'approx' },
  { stop_id: 'S06', stop_name: 'Melapudur', lat: 10.80783, lng: 78.69416, note: 'sourced/approx' },
  { stop_id: 'S07', stop_name: 'KKBT / Pan', lat: 10.79, lng: 78.72, note: 'approx' },
  { stop_id: 'S08', stop_name: 'Panjapur', lat: 10.7855, lng: 78.7175, note: 'approx' },
  { stop_id: 'S09', stop_name: 'No.1 Toll Gate', lat: 10.857, lng: 78.716, note: 'sourced/approx' },
  { stop_id: 'S10', stop_name: 'Thiruverumbur', lat: 10.77415, lng: 78.79166, note: 'sourced/approx' },
  { stop_id: 'S11', stop_name: 'BHEL / Kailasapuram', lat: 10.768, lng: 78.815, note: 'sourced/approx' },
  { stop_id: 'S12', stop_name: 'Samayapuram', lat: 10.92296, lng: 78.74054, note: 'sourced' },
  { stop_id: 'S13', stop_name: 'Srirangam', lat: 10.86, lng: 78.69, note: 'sourced' },
  { stop_id: 'S14', stop_name: 'Woraiyur', lat: 10.82806, lng: 78.67833, note: 'sourced' },
  { stop_id: 'S15', stop_name: 'Mannarpuram', lat: 10.785, lng: 78.703, note: 'approx' },
  { stop_id: 'S16', stop_name: 'Rockfort', lat: 10.829, lng: 78.699, note: 'approx' },
  { stop_id: 'S17', stop_name: 'Puthur', lat: 10.8005, lng: 78.69, note: 'approx' },
  { stop_id: 'S18', stop_name: 'Trichy Airport', lat: 10.765, lng: 78.7094, note: 'sourced/approx' },
  { stop_id: 'S19', stop_name: 'Iluppur Road', lat: 10.78, lng: 78.69, note: 'approx' },
  { stop_id: 'S20', stop_name: 'Palpannai', lat: 10.832, lng: 78.705, note: 'approx' },
  { stop_id: 'S21', stop_name: 'Sanjeevi Nagar', lat: 10.824, lng: 78.69, note: 'approx' },
  { stop_id: 'S22', stop_name: 'NN Road', lat: 10.8105, lng: 78.7253, note: 'approx' },
  { stop_id: 'S23', stop_name: 'KKBT terminus', lat: 10.789, lng: 78.723, note: 'approx' },
  { stop_id: 'S24', stop_name: 'Mutharasanallur', lat: 10.817, lng: 78.643, note: 'approx' },
  { stop_id: 'S25', stop_name: 'Bharathi Nagar', lat: 10.799, lng: 78.69, note: 'approx' },
];


export const buses: Bus[] = [
  { id: 'bus_1', busNumber: 'TN 37 C 1234', driver: 'M. Kumar', driverAvatar: '1', route: 101, status: 'Active', lat: 10.79861, lng: 78.68041 },
  { id: 'bus_2', busNumber: 'TN 38 A 5678', driver: 'S. Priya', driverAvatar: '2', route: 102, status: 'Active', lat: 10.83178, lng: 78.69323 },
  { id: 'bus_3', busNumber: 'TN 37 D 9012', driver: 'R. Suresh', driverAvatar: '3', route: 103, status: 'Delayed', lat: 10.82577, lng: 78.68337 },
  { id: 'bus_4', busNumber: 'TN 38 B 3456', driver: 'K. Anitha', driverAvatar: '4', route: 101, status: 'Active', lat: 10.824, lng: 78.6815 },
  { id: 'bus_5', busNumber: 'TN 37 E 7890', driver: 'V. Arun', driverAvatar: '5', route: 104, status: 'Inactive', lat: 10.80009, lng: 78.68786 },
  { id: 'bus_6', busNumber: 'TN 38 F 1230', driver: 'L. Meena', driverAvatar: '6', route: 102, status: 'Active', lat: 10.80783, lng: 78.69416 },
  { id: 'bus_7', busNumber: 'TN 37 G 4567', driver: 'P. Rajan', driverAvatar: '7', route: 105, status: 'Delayed', lat: 10.79, lng: 78.72 },
  { id: 'bus_8', busNumber: 'TN 38 H 8901', driver: 'G. Devi', driverAvatar: '8', route: 103, status: 'Active', lat: 10.7855, lng: 78.7175 },
];


export const alerts = [
  { id: 'alert_1', type: 'SOS', busNumber: 'TN 37 D 9012', message: 'Mechanical issue reported.' },
  { id: 'alert_2', type: 'Delayed', busNumber: 'TN 37 G 4567', message: 'Heavy traffic on Gandhipuram flyover.' },
  { id: 'alert_3', type: 'Inactive', busNumber: 'TN 37 E 7890', message: 'Bus offline for 30 minutes.' },
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
