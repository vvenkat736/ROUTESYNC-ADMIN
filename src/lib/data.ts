
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

  // Madurai Stops
  { stop_id: 'M01', stop_name: 'Mattuthavani Bus Stand', lat: 9.9463, lng: 78.1583, note: 'MGR Bus Stand', city: 'madurai' },
  { stop_id: 'M02', stop_name: 'Periyar Bus Stand', lat: 9.9145, lng: 78.1143, note: '', city: 'madurai' },

  // Dindigul Stops
  { stop_id: 'D01', stop_name: 'Dindigul Bus Stand', lat: 10.3683, lng: 77.9607, note: '', city: 'dindigul' },

  // Tindivanam Stops
  { stop_id: 'V01', stop_name: 'Tindivanam Bus Stand', lat: 12.2393, lng: 79.6468, note: '', city: 'thindivanam' },

  // Coimbatore Stops
  { stop_id: 'C01', stop_name: 'Gandhipuram Central Bus Terminus', lat: 11.0183, lng: 76.9634, note: '', city: 'coimbatore' },
  { stop_id: 'C02', stop_name: 'Ukkadam Bus Terminus', lat: 10.9922, lng: 76.9641, note: '', city: 'coimbatore' },

  // Kanyakumari Stops
  { stop_id: 'K01', stop_name: 'Kanyakumari Bus Stand', lat: 8.0883, lng: 77.5453, note: '', city: 'kanyakumari' },

  // Tirunelveli Stops
  { stop_id: 'N01', stop_name: 'Tirunelveli New Bus Stand', lat: 8.7037, lng: 77.7247, note: '', city: 'thirunelveli' },
];


export const buses: Omit<Bus, 'id'>[] = [
  // Trichy Buses
  { busNumber: 'TN 45 C 1234', driver: 'M. Kumar', driverAvatar: '1', route: 'R-TR-1', status: 'Active', lat: 10.79861, lng: 78.68041, city: 'trichy', occupancy: 'Half-Full', nextStop: 'Heber Road', nextStopETA: 5 },
  { busNumber: 'TN 45 A 5678', driver: 'S. Priya', driverAvatar: '2', route: 'R-TR-2', status: 'Active', lat: 10.83178, lng: 78.69323, city: 'trichy', occupancy: 'Full', nextStop: 'Palpannai', nextStopETA: 3 },
  { busNumber: 'TN 45 D 9012', driver: 'R. Suresh', driverAvatar: '3', route: 'R-TR-1', status: 'Delayed', lat: 10.82577, lng: 78.68337, city: 'trichy', occupancy: 'Overcrowded', nextStop: 'Chathiram', nextStopETA: 15 },
  { busNumber: 'TN 45 B 3456', driver: 'K. Anitha', driverAvatar: '4', route: 'R-TR-1', status: 'Active', lat: 10.824, lng: 78.6815, city: 'trichy', occupancy: 'Empty', nextStop: 'Thillai Nagar', nextStopETA: 8 },
  { busNumber: 'TN 45 E 7890', driver: 'V. Arun', driverAvatar: '5', route: 'R-TR-2', status: 'Inactive', lat: 10.80009, lng: 78.68786, city: 'trichy', occupancy: 'Empty', nextStop: 'N/A', nextStopETA: 0 },
  
  // Madurai Buses
  { busNumber: 'TN 58 F 1122', driver: 'P. Pandi', driverAvatar: '6', route: 'R-MD-1', status: 'Active', lat: 9.9463, lng: 78.1583, city: 'madurai', occupancy: 'Full', nextStop: 'Periyar Bus Stand', nextStopETA: 12 },
  
  // Dindigul Buses
  { busNumber: 'TN 57 G 3344', driver: 'L. Lakshmi', driverAvatar: '7', route: 'R-DG-1', status: 'Active', lat: 10.3683, lng: 77.9607, city: 'dindigul', occupancy: 'Half-Full', nextStop: 'Dindigul Market', nextStopETA: 9 },

  // Thindivanam Buses
  { busNumber: 'TN 16 H 5566', driver: 'G. Ganesh', driverAvatar: '8', route: 'R-TV-1', status: 'Delayed', lat: 12.2393, lng: 79.6468, city: 'thindivanam', occupancy: 'Full', nextStop: 'Tindivanam RTO', nextStopETA: 20 },
  
  // Coimbatore Buses
  { busNumber: 'TN 66 J 7788', driver: 'A. Devi', driverAvatar: '1', route: 'R-CB-1', status: 'Active', lat: 11.0183, lng: 76.9634, city: 'coimbatore', occupancy: 'Half-Full', nextStop: 'Ukkadam Bus Terminus', nextStopETA: 7 },
  
  // Kanyakumari Buses
  { busNumber: 'TN 74 K 9900', driver: 'S. Murugan', driverAvatar: '2', route: 'R-KK-1', status: 'Active', lat: 8.0883, lng: 77.5453, city: 'kanyakumari', occupancy: 'Empty', nextStop: 'Vivekananda Rock', nextStopETA: 4 },
  
  // Thirunelveli Buses
  { busNumber: 'TN 72 M 1212', driver: 'T. Meena', driverAvatar: '3', route: 'R-TVL-1', status: 'Inactive', lat: 8.7037, lng: 77.7247, city: 'thirunelveli', occupancy: 'Empty', nextStop: 'N/A', nextStopETA: 0 },
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
    { route_id: "R-TR-1", route_name: "Central Bus Stand - Srirangam", bus_type: "Express", stop_sequence: 1, stop_name: "Central Bus Stand", city: "trichy" },
    { route_id: "R-TR-1", stop_sequence: 2, stop_name: "Heber Road", city: "trichy" },
    { route_id: "R-TR-1", stop_sequence: 3, stop_name: "Puthur", city: "trichy" },
    { route_id: "R-TR-1", stop_sequence: 4, stop_name: "Thillai Nagar", city: "trichy" },
    { route_id: "R-TR-1", stop_sequence: 5, stop_name: "Chathiram", city: "trichy" },
    { route_id: "R-TR-1", stop_sequence: 6, stop_name: "Rockfort", city: "trichy" },
    { route_id: "R-TR-1", stop_sequence: 7, stop_name: "Srirangam", city: "trichy" },
    { route_id: "R-TR-2", route_name: "Chathiram - Thiruverumbur", bus_type: "Deluxe", stop_sequence: 1, stop_name: "Chathiram", city: "trichy" },
    { route_id: "R-TR-2", stop_sequence: 2, stop_name: "Palpannai", city: "trichy" },
    { route_id: "R-TR-2", stop_sequence: 3, stop_name: "Melapudur", city: "trichy" },
    { route_id: "R-TR-2", stop_sequence: 4, stop_name: "NN Road", city: "trichy" },
    { route_id: "R-TR-2", stop_sequence: 5, stop_name: "Thiruverumbur", city: "trichy" },
    { route_id: "R-TR-2", stop_sequence: 6, stop_name: "BHEL / Kailasapuram", city: "trichy" },

    // Tanjavur Route
    { route_id: "R-TJ-1", route_name: "New Bus Stand - Old Bus Stand", bus_type: "Express", stop_sequence: 1, stop_name: "Tanjavur New Bus Stand", city: "tanjavur" },
    { route_id: "R-TJ-1", stop_sequence: 2, stop_name: "Tanjavur Junction", city: "tanjavur" },
    { route_id: "R-TJ-1", stop_sequence: 3, stop_name: "Brihadeeswarar Temple", city: "tanjavur" },
    { route_id: "R-TJ-1", stop_sequence: 4, stop_name: "Tanjavur Old Bus Stand", city: "tanjavur" },

    // Erode Route
    { route_id: "R-E-1", route_name: "Erode Bus Terminus - Perundurai", bus_type: "Standard", stop_sequence: 1, stop_name: "Erode Central Bus Terminus", city: "erode" },
    { route_id: "R-E-1", stop_sequence: 2, stop_name: "Erode Junction", city: "erode" },
    { route_id: "R-E-1", stop_sequence: 3, stop_name: "Moolapalayam", city: "erode" },
    { route_id: "R-E-1", stop_sequence: 4, stop_name: "Perundurai", city: "erode" },

    // Salem Route
    { route_id: "R-SL-1", route_name: "New Bus Stand - Salem Junction", bus_type: "Deluxe", stop_sequence: 1, stop_name: "Salem New Bus Stand", city: "salem" },
    { route_id: "R-SL-1", stop_sequence: 2, stop_name: "Hasthampatti", city: "salem" },
    { route_id: "R-SL-1", stop_sequence: 3, stop_name: "Salem Old Bus Stand", city: "salem" },
    { route_id: "R-SL-1", stop_sequence: 4, stop_name: "Salem Junction", city: "salem" },

    // Madurai Route
    { route_id: "R-MD-1", route_name: "Mattuthavani - Periyar", bus_type: "Express", stop_sequence: 1, stop_name: "Mattuthavani Bus Stand", city: "madurai" },
    { route_id: "R-MD-1", stop_sequence: 2, stop_name: "Periyar Bus Stand", city: "madurai" },

    // Dindigul Route
    { route_id: "R-DG-1", route_name: "Dindigul Main", bus_type: "Standard", stop_sequence: 1, stop_name: "Dindigul Bus Stand", city: "dindigul" },

    // Thindivanam Route
    { route_id: "R-TV-1", route_name: "Thindivanam Circle", bus_type: "Standard", stop_sequence: 1, stop_name: "Tindivanam Bus Stand", city: "thindivanam" },
    
    // Coimbatore Route
    { route_id: "R-CB-1", route_name: "Gandhipuram - Ukkadam", bus_type: "Deluxe", stop_sequence: 1, stop_name: "Gandhipuram Central Bus Terminus", city: "coimbatore" },
    { route_id: "R-CB-1", stop_sequence: 2, stop_name: "Ukkadam Bus Terminus", city: "coimbatore" },
    
    // Kanyakumari Route
    { route_id: "R-KK-1", route_name: "Beach Route", bus_type: "Tourist", stop_sequence: 1, stop_name: "Kanyakumari Bus Stand", city: "kanyakumari" },

    // Thirunelveli Route
    { route_id: "R-TVL-1", route_name: "Junction - New Stand", bus_type: "Express", stop_sequence: 1, stop_name: "Tirunelveli New Bus Stand", city: "thirunelveli" },
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

    

    

