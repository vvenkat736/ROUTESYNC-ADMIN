
export type Bus = {
  id: string; // Changed to string to match firestore doc id
  busNumber: string;
  driver: string;
  driverAvatar: string;
  route: string; // Changed to string to match new route_id format
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

export const stops: Stop[] = [
  // Trichy Stops
  { stop_id: 'S01', stop_name: 'Central Bus Stand', lat: 10.79861, lng: 78.68041, note: '', city: 'trichy' },
  { stop_id: 'S02', stop_name: 'Chathiram', lat: 10.83178, lng: 78.69323, note: '', city: 'trichy' },
  { stop_id: 'S03', stop_name: 'Thillai Nagar', lat: 10.82577, lng: 78.68337, note: '', city: 'trichy' },
  { stop_id: 'S04', stop_name: 'Sastri Road', lat: 10.824, lng: 78.6815, note: '', city: 'trichy' },
  { stop_id: 'S05', stop_name: 'Heber Road', lat: 10.80009, lng: 78.68786, note: '', city: 'trichy' },
  { stop_id: 'S06', stop_name: 'Melapudur', lat: 10.80783, lng: 78.69416, note: '', city: 'trichy' },
  { stop_id: 'S07', stop_name: 'KKBT / Pan', lat: 10.79, lng: 78.72, note: '', city: 'trichy' },
  { stop_id: 'S08', stop_name: 'Panjapur', lat: 10.7855, lng: 78.7175, note: '', city: 'trichy' },
  { stop_id: 'S09', stop_name: 'No.1 Toll Gate', lat: 10.857, lng: 78.716, note: '', city: 'trichy' },
  { stop_id: 'S10', stop_name: 'Thiruverumbur', lat: 10.77415, lng: 78.79166, note: '', city: 'trichy' },
  { stop_id: 'S11', stop_name: 'BHEL / Kailasapuram', lat: 10.768, lng: 78.815, note: '', city: 'trichy' },
  { stop_id: 'S12', stop_name: 'Samayapuram', lat: 10.92296, lng: 78.74054, note: '', city: 'trichy' },
  { stop_id: 'S13', stop_name: 'Srirangam', lat: 10.86, lng: 78.69, note: '', city: 'trichy' },
  { stop_id: 'S14', stop_name: 'Woraiyur', lat: 10.82806, lng: 78.67833, note: '', city: 'trichy' },
  { stop_id: 'S15', stop_name: 'Mannarpuram', lat: 10.785, lng: 78.703, note: '', city: 'trichy' },
  { stop_id: 'S16', stop_name: 'Rockfort', lat: 10.829, lng: 78.699, note: '', city: 'trichy' },
  { stop_id: 'S17', stop_name: 'Puthur', lat: 10.8005, lng: 78.69, note: '', city: 'trichy' },
  { stop_id: 'S18', stop_name: 'Trichy Airport', lat: 10.765, lng: 78.7094, note: '', city: 'trichy' },
  { stop_id: 'S19', stop_name: 'Iluppur Road', lat: 10.78, lng: 78.69, note: '', city: 'trichy' },
  { stop_id: 'S20', stop_name: 'Palpannai', lat: 10.832, lng: 78.705, note: '', city: 'trichy' },
  { stop_id: 'S21', stop_name: 'Sanjeevi Nagar', lat: 10.824, lng: 78.69, note: '', city: 'trichy' },
  { stop_id: 'S22', stop_name: 'NN Road', lat: 10.8105, lng: 78.7253, note: '', city: 'trichy' },
  { stop_id: 'S23', stop_name: 'KKBT terminus', lat: 10.789, lng: 78.723, note: '', city: 'trichy' },
  { stop_id: 'S24', stop_name: 'Mutharasanallur', lat: 10.817, lng: 78.643, note: '', city: 'trichy' },
  { stop_id: 'S25', stop_name: 'Bharathi Nagar', lat: 10.799, lng: 78.69, note: '', city: 'trichy' },

  // Tanjavur Stops
  { stop_id: 'T01', stop_name: 'Tanjavur Old Bus Stand', lat: 10.7900, lng: 79.1384, note: '', city: 'tanjavur' },
  { stop_id: 'T02', stop_name: 'Tanjavur New Bus Stand', lat: 10.7551, lng: 79.1170, note: '', city: 'tanjavur' },
  { stop_id: 'T03', stop_name: 'Brihadeeswarar Temple', lat: 10.7828, lng: 79.1318, note: '', city: 'tanjavur' },
  { stop_id: 'T04', stop_name: 'Tanjavur Junction', lat: 10.7865, lng: 79.1194, note: '', city: 'tanjavur' },

  // Erode Stops
  { stop_id: 'E01', stop_name: 'Erode Central Bus Terminus', lat: 11.3360, lng: 77.7186, note: '', city: 'erode' },
  { stop_id: 'E02', stop_name: 'Erode Junction', lat: 11.3414, lng: 77.7077, note: '', city: 'erode' },
  { stop_id: 'E03', stop_name: 'Moolapalayam', lat: 11.3533, lng: 77.6975, note: '', city: 'erode' },
  { stop_id: 'E04', stop_name: 'Perundurai', lat: 11.2750, lng: 77.5833, note: '', city: 'erode' },

  // Salem Stops
  { stop_id: 'L01', stop_name: 'Salem New Bus Stand', lat: 11.6643, lng: 78.1460, note: '', city: 'salem' },
  { stop_id: 'L02', stop_name: 'Salem Old Bus Stand', lat: 11.6534, lng: 78.1639, note: '', city: 'salem' },
  { stop_id: 'L03', stop_name: 'Salem Junction', lat: 11.6708, lng: 78.1255, note: '', city: 'salem' },
  { stop_id: 'L04', stop_name: 'Hasthampatti', lat: 11.6766, lng: 78.1508, note: '', city: 'salem' },
];


export const buses: Omit<Bus, 'id'>[] = [
  // Trichy Buses
  { busNumber: 'TN 45 C 1234', driver: 'M. Kumar', driverAvatar: '1', route: 'R-TR-1', status: 'Active', lat: 10.79861, lng: 78.68041, city: 'trichy', occupancy: 'Half-Full', nextStop: 'Heber Road', nextStopETA: 5 },
  { busNumber: 'TN 45 A 5678', driver: 'S. Priya', driverAvatar: '2', route: 'R-TR-2', status: 'Active', lat: 10.83178, lng: 78.69323, city: 'trichy', occupancy: 'Full', nextStop: 'Palpannai', nextStopETA: 3 },
  { busNumber: 'TN 45 D 9012', driver: 'R. Suresh', driverAvatar: '3', route: 'R-TR-1', status: 'Delayed', lat: 10.82577, lng: 78.68337, city: 'trichy', occupancy: 'Overcrowded', nextStop: 'Chathiram', nextStopETA: 15 },
  { busNumber: 'TN 45 B 3456', driver: 'K. Anitha', driverAvatar: '4', route: 'R-TR-1', status: 'Active', lat: 10.824, lng: 78.6815, city: 'trichy', occupancy: 'Empty', nextStop: 'Thillai Nagar', nextStopETA: 8 },
  { busNumber: 'TN 45 E 7890', driver: 'V. Arun', driverAvatar: '5', route: 'R-TR-2', status: 'Inactive', lat: 10.80009, lng: 78.68786, city: 'trichy', occupancy: 'Empty', nextStop: 'N/A', nextStopETA: 0 },

  // Tanjavur Buses
  { busNumber: 'TN 49 C 1111', driver: 'A. Ganesh', driverAvatar: '1', route: 'R-TA-1', status: 'Active', lat: 10.7900, lng: 79.1384, city: 'tanjavur', occupancy: 'Full', nextStop: 'Tanjavur Junction', nextStopETA: 7 },
  { busNumber: 'TN 49 A 2222', driver: 'B. Lakshmi', driverAvatar: '2', route: 'R-TA-1', status: 'Delayed', lat: 10.7828, lng: 79.1318, city: 'tanjavur', occupancy: 'Half-Full', nextStop: 'Old Bus Stand', nextStopETA: 12 },
  { busNumber: 'TN 49 B 3333', driver: 'C. David', driverAvatar: '3', route: 'R-TA-2', status: 'Active', lat: 10.7551, lng: 79.1170, city: 'tanjavur', occupancy: 'Empty', nextStop: 'Medical College', nextStopETA: 4 },
  { busNumber: 'TN 49 D 4444', driver: 'D. Mary', driverAvatar: '4', route: 'R-TA-2', status: 'Inactive', lat: 10.76, lng: 79.12, city: 'tanjavur', occupancy: 'Empty', nextStop: 'N/A', nextStopETA: 0 },
  { busNumber: 'TN 49 E 5555', driver: 'E. John', driverAvatar: '5', route: 'R-TA-1', status: 'Active', lat: 10.78, lng: 79.125, city: 'tanjavur', occupancy: 'Overcrowded', nextStop: 'Brihadeeswarar Temple', nextStopETA: 6 },
  
  // Erode Buses
  { busNumber: 'TN 33 D 1212', driver: 'F. Murugan', driverAvatar: '6', route: 'R-ER-1', status: 'Active', lat: 11.3360, lng: 77.7186, city: 'erode', occupancy: 'Half-Full', nextStop: 'Erode Junction', nextStopETA: 9 },
  { busNumber: 'TN 33 B 2323', driver: 'G. Saraswathi', driverAvatar: '7', route: 'R-ER-1', status: 'Inactive', lat: 11.3533, lng: 77.6975, city: 'erode', occupancy: 'Empty', nextStop: 'N/A', nextStopETA: 0 },
  { busNumber: 'TN 33 A 3434', driver: 'H. Velu', driverAvatar: '8', route: 'R-ER-2', status: 'Delayed', lat: 11.3414, lng: 77.7077, city: 'erode', occupancy: 'Full', nextStop: 'Collector Office', nextStopETA: 20 },
  { busNumber: 'TN 33 C 4545', driver: 'I. Sheela', driverAvatar: '1', route: 'R-ER-2', status: 'Active', lat: 11.32, lng: 77.71, city: 'erode', occupancy: 'Empty', nextStop: 'GH', nextStopETA: 5 },
  { busNumber: 'TN 33 E 5656', driver: 'J. Raja', driverAvatar: '2', route: 'R-ER-1', status: 'Active', lat: 11.28, lng: 77.6, city: 'erode', occupancy: 'Full', nextStop: 'Perundurai', nextStopETA: 10 },
  
  // Salem Buses
  { busNumber: 'TN 30 E 1001', driver: 'K. Ramesh', driverAvatar: '3', route: 'R-SA-1', status: 'Delayed', lat: 11.6643, lng: 78.1460, city: 'salem', occupancy: 'Overcrowded', nextStop: 'Hasthampatti', nextStopETA: 25 },
  { busNumber: 'TN 30 F 2002', driver: 'L. Vimala', driverAvatar: '4', route: 'R-SA-1', status: 'Active', lat: 11.6708, lng: 78.1255, city: 'salem', occupancy: 'Half-Full', nextStop: 'Old Bus Stand', nextStopETA: 11 },
  { busNumber: 'TN 30 A 3003', driver: 'M. Selvam', driverAvatar: '5', route: 'R-SA-2', status: 'Active', lat: 11.6534, lng: 78.1639, city: 'salem', occupancy: 'Full', nextStop: '5 Roads', nextStopETA: 4 },
  { busNumber: 'TN 30 B 4004', driver: 'N. Devi', driverAvatar: '6', route: 'R-SA-2', status: 'Active', lat: 11.68, lng: 78.16, city: 'salem', occupancy: 'Empty', nextStop: 'New Bus Stand', nextStopETA: 9 },
  { busNumber: 'TN 30 C 5005', driver: 'O. Babu', driverAvatar: '7', route: 'R-SA-1', status: 'Inactive', lat: 11.66, lng: 78.15, city: 'salem', occupancy: 'Empty', nextStop: 'N/A', nextStopETA: 0 },
];

// This is now just for seeding and type reference.
// The app will now store and read full route objects from Firestore.
export const routes: {
  route_id: string,
  route_name?: string,
  bus_type?: string,
  stop_sequence: number,
  stop_name: string,
  city: string,
}[] = [
    // Trichy Routes
    { route_id: "R-01", route_name: "Central Bus Stand - Srirangam", bus_type: "Express", stop_sequence: 1, stop_name: "Central Bus Stand", city: "trichy" },
    { route_id: "R-01", stop_sequence: 2, stop_name: "Heber Road", city: "trichy" },
    { route_id: "R-01", stop_sequence: 3, stop_name: "Puthur", city: "trichy" },
    { route_id: "R-01", stop_sequence: 4, stop_name: "Thillai Nagar", city: "trichy" },
    { route_id: "R-01", stop_sequence: 5, stop_name: "Chathiram", city: "trichy" },
    { route_id: "R-01", stop_sequence: 6, stop_name: "Rockfort", city: "trichy" },
    { route_id: "R-01", stop_sequence: 7, stop_name: "Srirangam", city: "trichy" },
    { route_id: "R-02", route_name: "Chathiram - Thiruverumbur", bus_type: "Deluxe", stop_sequence: 1, stop_name: "Chathiram", city: "trichy" },
    { route_id: "R-02", stop_sequence: 2, stop_name: "Palpannai", city: "trichy" },
    { route_id: "R-02", stop_sequence: 3, stop_name: "Melapudur", city: "trichy" },
    { route_id: "R-02", stop_sequence: 4, stop_name: "NN Road", city: "trichy" },
    { route_id: "R-02", stop_sequence: 5, stop_name: "Thiruverumbur", city: "trichy" },
    { route_id: "R-02", stop_sequence: 6, stop_name: "BHEL / Kailasapuram", city: "trichy" },

    // Tanjavur Route
    { route_id: "R-T1", route_name: "New Bus Stand - Old Bus Stand", bus_type: "Express", stop_sequence: 1, stop_name: "Tanjavur New Bus Stand", city: "tanjavur" },
    { route_id: "R-T1", stop_sequence: 2, stop_name: "Tanjavur Junction", city: "tanjavur" },
    { route_id: "R-T1", stop_sequence: 3, stop_name: "Brihadeeswarar Temple", city: "tanjavur" },
    { route_id: "R-T1", stop_sequence: 4, stop_name: "Tanjavur Old Bus Stand", city: "tanjavur" },

    // Erode Route
    { route_id: "R-E1", route_name: "Erode Bus Terminus - Perundurai", bus_type: "Standard", stop_sequence: 1, stop_name: "Erode Central Bus Terminus", city: "erode" },
    { route_id: "R-E1", stop_sequence: 2, stop_name: "Erode Junction", city: "erode" },
    { route_id: "R-E1", stop_sequence: 3, stop_name: "Moolapalayam", city: "erode" },
    { route_id: "R-E1", stop_sequence: 4, stop_name: "Perundurai", city: "erode" },

    // Salem Route
    { route_id: "R-L1", route_name: "New Bus Stand - Salem Junction", bus_type: "Deluxe", stop_sequence: 1, stop_name: "Salem New Bus Stand", city: "salem" },
    { route_id: "R-L1", stop_sequence: 2, stop_name: "Hasthampatti", city: "salem" },
    { route_id: "R-L1", stop_sequence: 3, stop_name: "Salem Old Bus Stand", city: "salem" },
    { route_id: "R-L1", stop_sequence: 4, stop_name: "Salem Junction", city: "salem" },
];


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

    