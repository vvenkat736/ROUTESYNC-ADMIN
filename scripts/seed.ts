

// A script to seed the Firestore database with initial data.
// To run this script, ensure you have ts-node installed (npm install -g ts-node)
// and your Firebase project is initialized.
// Then run: ts-node scripts/seed.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, Timestamp, doc } from 'firebase/firestore';

// IMPORTANT: Replace with your actual Firebase project configuration
const firebaseConfig = {
  projectId: "studio-1144301721-8385a",
  appId: "1:488781451659:web:aba6bbee8a3b849ef1df8e",
  apiKey: "AIzaSyCpGambMSm71fLy3uqR0Akjx91qxekpAdA",
  authDomain: "studio-1144301721-8385a.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const drivers = [
    // Trichy
    { driverId: 'D-TR-001', name: 'M. Kumar', phoneNumber: '9876543210', city: 'trichy' },
    { driverId: 'D-TR-002', name: 'R. Suresh', phoneNumber: '9876543211', city: 'trichy' },
    { driverId: 'D-TR-003', name: 'V. Arun', phoneNumber: '9876543212', city: 'trichy' },
    { driverId: 'D-TR-004', name: 'G. Ramesh', phoneNumber: '9876543213', city: 'trichy' },
    { driverId: 'D-TR-005', name: 'S. Karthik', phoneNumber: '9876543214', city: 'trichy' },
    // Tanjavur
    { driverId: 'D-TJ-001', name: 'A. Balaji', phoneNumber: '9876543215', city: 'tanjavur' },
    { driverId: 'D-TJ-002', name: 'K. Vignesh', phoneNumber: '9876543216', city: 'tanjavur' },
    { driverId: 'D-TJ-003', name: 'P. Anand', phoneNumber: '9876543217', city: 'tanjavur' },
    { driverId: 'D-TJ-004', name: 'M. Rajesh', phoneNumber: '9876543218', city: 'tanjavur' },
    { driverId: 'D-TJ-005', name: 'S. Prabhu', phoneNumber: '9876543219', city: 'tanjavur' },
    // Erode
    { driverId: 'D-ER-001', name: 'N. Senthil', phoneNumber: '9876543220', city: 'erode' },
    { driverId: 'D-ER-002', name: 'T. Saravanan', phoneNumber: '9876543221', city: 'erode' },
    { driverId: 'D-ER-003', name: 'L. Manikandan', phoneNumber: '9876543222', city: 'erode' },
    { driverId: 'D-ER-004', name: 'V. Dinesh', phoneNumber: '9876543223', city: 'erode' },
    { driverId: 'D-ER-005', name: 'C. Murugan', phoneNumber: '9876543224', city: 'erode' },
    // Salem
    { driverId: 'D-SL-001', name: 'D. Selvam', phoneNumber: '9876543225', city: 'salem' },
    { driverId: 'D-SL-002', name: 'J. Prakash', phoneNumber: '9876543226', city: 'salem' },
    { driverId: 'D-SL-003', name: 'B. Vinoth', phoneNumber: '9876543227', city: 'salem' },
    { driverId: 'D-SL-004', name: 'H. Aravind', phoneNumber: '9876543228', city: 'salem' },
    { driverId: 'D-SL-005', name: 'E. Gowtham', phoneNumber: '9876543229', city: 'salem' },
    // Madurai
    { driverId: 'D-MD-001', name: 'P. Pandi', phoneNumber: '9876543230', city: 'madurai' },
    { driverId: 'D-MD-002', name: 'M. Muthu', phoneNumber: '9876543231', city: 'madurai' },
    { driverId: 'D-MD-003', name: 'K. Karuppasamy', phoneNumber: '9876543232', city: 'madurai' },
    { driverId: 'D-MD-004', name: 'S. Ganesan', phoneNumber: '9876543233', city: 'madurai' },
    { driverId: 'D-MD-005', name: 'V. Velu', phoneNumber: '9876543234', city: 'madurai' },
    // Dindigul
    { driverId: 'D-DG-001', name: 'R. Baskar', phoneNumber: '9876543235', city: 'dindigul' },
    { driverId: 'D-DG-002', name: 'S. Solomon', phoneNumber: '9876543236', city: 'dindigul' },
    { driverId: 'D-DG-003', name: 'A. Antony', phoneNumber: '9876543237', city: 'dindigul' },
    { driverId: 'D-DG-004', name: 'M. Mariappan', phoneNumber: '9876543238', city: 'dindigul' },
    { driverId: 'D-DG-005', name: 'T. Thomas', phoneNumber: '9876543239', city: 'dindigul' },
    // Thindivanam
    { driverId: 'D-TV-001', name: 'G. Ganesh', phoneNumber: '9876543240', city: 'thindivanam' },
    { driverId: 'D-TV-002', name: 'K. Krishnan', phoneNumber: '9876543241', city: 'thindivanam' },
    { driverId: 'D-TV-003', name: 'V. Venkatesh', phoneNumber: '9876543242', city: 'thindivanam' },
    { driverId: 'D-TV-004', name: 'R. Raghu', phoneNumber: '9876543243', city: 'thindivanam' },
    { driverId: 'D-TV-005', name: 'M. Mohan', phoneNumber: '9876543244', city: 'thindivanam' },
    // Coimbatore
    { driverId: 'D-CB-001', name: 'P. Palanisamy', phoneNumber: '9876543245', city: 'coimbatore' },
    { driverId: 'D-CB-002', name: 'C. Chinnasamy', phoneNumber: '9876543246', city: 'coimbatore' },
    { driverId: 'D-CB-003', name: 'R. Ramasamy', phoneNumber: '9876543247', city: 'coimbatore' },
    { driverId: 'D-CB-004', name: 'K. Kandhasamy', phoneNumber: '9876543248', city: 'coimbatore' },
    { driverId: 'D-CB-005', name: 'S. Subramani', phoneNumber: '9876543249', city: 'coimbatore' },
    // Kanyakumari
    { driverId: 'D-KK-001', name: 'S. Murugan', phoneNumber: '9876543250', city: 'kanyakumari' },
    { driverId: 'D-KK-002', name: 'J. Jeyaraj', phoneNumber: '9876543251', city: 'kanyakumari' },
    { driverId: 'D-KK-003', name: 'A. Arul', phoneNumber: '9876543252', city: 'kanyakumari' },
    { driverId: 'D-KK-004', name: 'P. Peter', phoneNumber: '9876543253', city: 'kanyakumari' },
    { driverId: 'D-KK-005', name: 'N. Nelson', phoneNumber: '9876543254', city: 'kanyakumari' },
    // Thirunelveli
    { driverId: 'D-TVL-001', name: 'M. Marimuthu', phoneNumber: '9876543255', city: 'thirunelveli' },
    { driverId: 'D-TVL-002', name: 'S. Sankaran', phoneNumber: '9876543256', city: 'thirunelveli' },
    { driverId: 'D-TVL-003', name: 'A. Ayyanar', phoneNumber: '9876543257', city: 'thirunelveli' },
    { driverId: 'D-TVL-004', name: 'K. Kasirajan', phoneNumber: '9876543258', city: 'thirunelveli' },
    { driverId: 'D-TVL-005', name: 'V. Veeramani', phoneNumber: '9876543259', city: 'thirunelveli' },
];

const stops = [
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

const buses = [
    // Trichy
    { busNumber: 'TN 45 C 1234', driver: 'M. Kumar', route: 'R-TR-1', status: 'Active', lat: 10.79861, lng: 78.68041, city: 'trichy', occupancy: 'Half-Full', nextStop: 'Heber Road', nextStopETA: 5 },
    { busNumber: 'TN 45 A 5678', driver: 'R. Suresh', route: 'R-TR-2', status: 'Active', lat: 10.83178, lng: 78.69323, city: 'trichy', occupancy: 'Full', nextStop: 'Palpannai', nextStopETA: 3 },
    { busNumber: 'TN 45 D 9012', driver: 'V. Arun', route: 'R-TR-1', status: 'Delayed', lat: 10.82577, lng: 78.68337, city: 'trichy', occupancy: 'Overcrowded', nextStop: 'Chathiram', nextStopETA: 15 },
    
    // Tanjavur
    { busNumber: 'TN 49 F 1122', driver: 'A. Balaji', route: 'R-TJ-1', status: 'Active', lat: 10.7900, lng: 79.1384, city: 'tanjavur', occupancy: 'Full', nextStop: 'Tanjavur Junction', nextStopETA: 12 },
    { busNumber: 'TN 49 G 2233', driver: 'K. Vignesh', route: 'R-TJ-1', status: 'Active', lat: 10.7551, lng: 79.1170, city: 'tanjavur', occupancy: 'Half-Full', nextStop: 'Brihadeeswarar Temple', nextStopETA: 8 },
    
    // Erode
    { busNumber: 'TN 33 H 3344', driver: 'N. Senthil', route: 'R-E-1', status: 'Active', lat: 11.3360, lng: 77.7186, city: 'erode', occupancy: 'Half-Full', nextStop: 'Erode Junction', nextStopETA: 9 },
    { busNumber: 'TN 33 J 4455', driver: 'T. Saravanan', route: 'R-E-1', status: 'Inactive', lat: 11.3414, lng: 77.7077, city: 'erode', occupancy: 'Empty', nextStop: 'N/A', nextStopETA: 0 },
    
    // Salem
    { busNumber: 'TN 30 K 5566', driver: 'D. Selvam', route: 'R-SL-1', status: 'Delayed', lat: 11.6643, lng: 78.1460, city: 'salem', occupancy: 'Full', nextStop: 'Salem Old Bus Stand', nextStopETA: 20 },
    { busNumber: 'TN 30 L 6677', driver: 'J. Prakash', route: 'R-SL-1', status: 'Active', lat: 11.6534, lng: 78.1639, city: 'salem', occupancy: 'Empty', nextStop: 'Salem Junction', nextStopETA: 6 },
    
    // Madurai
    { busNumber: 'TN 58 M 7788', driver: 'P. Pandi', route: 'R-MD-1', status: 'Active', lat: 9.9463, lng: 78.1583, city: 'madurai', occupancy: 'Half-Full', nextStop: 'Periyar Bus Stand', nextStopETA: 11 },
    { busNumber: 'TN 58 N 8899', driver: 'M. Muthu', route: 'R-MD-1', status: 'Active', lat: 9.9145, lng: 78.1143, city: 'madurai', occupancy: 'Full', nextStop: 'Mattuthavani Bus Stand', nextStopETA: 14 },
    
    // Dindigul
    { busNumber: 'TN 57 P 9900', driver: 'R. Baskar', route: 'R-DG-1', status: 'Active', lat: 10.3683, lng: 77.9607, city: 'dindigul', occupancy: 'Half-Full', nextStop: 'Dindigul Market', nextStopETA: 7 },
    { busNumber: 'TN 57 R 1111', driver: 'S. Solomon', route: 'R-DG-1', status: 'Active', lat: 10.37, lng: 77.95, city: 'dindigul', occupancy: 'Empty', nextStop: 'Collector Office', nextStopETA: 4 },

    // Thindivanam
    { busNumber: 'TN 16 Q 1212', driver: 'G. Ganesh', route: 'R-TV-1', status: 'Active', lat: 12.2393, lng: 79.6468, city: 'thindivanam', occupancy: 'Empty', nextStop: 'Tindivanam RTO', nextStopETA: 5 },
    { busNumber: 'TN 16 S 2222', driver: 'K. Krishnan', route: 'R-TV-1', status: 'Inactive', lat: 12.25, lng: 79.65, city: 'thindivanam', occupancy: 'Empty', nextStop: 'N/A', nextStopETA: 0 },

    // Coimbatore
    { busNumber: 'TN 66 R 2323', driver: 'P. Palanisamy', route: 'R-CB-1', status: 'Active', lat: 11.0183, lng: 76.9634, city: 'coimbatore', occupancy: 'Full', nextStop: 'Ukkadam Bus Terminus', nextStopETA: 9 },
    { busNumber: 'TN 66 S 3434', driver: 'C. Chinnasamy', route: 'R-CB-1', status: 'Delayed', lat: 10.9922, lng: 76.9641, city: 'coimbatore', occupancy: 'Overcrowded', nextStop: 'Gandhipuram', nextStopETA: 22 },
    
    // Kanyakumari
    { busNumber: 'TN 74 T 4545', driver: 'S. Murugan', route: 'R-KK-1', status: 'Active', lat: 8.0883, lng: 77.5453, city: 'kanyakumari', occupancy: 'Half-Full', nextStop: 'Vivekananda Rock', nextStopETA: 4 },
    { busNumber: 'TN 74 U 5555', driver: 'J. Jeyaraj', route: 'R-KK-1', status: 'Active', lat: 8.09, lng: 77.55, city: 'kanyakumari', occupancy: 'Full', nextStop: 'Sunset Point', nextStopETA: 6 },

    // Thirunelveli
    { busNumber: 'TN 72 U 5656', driver: 'M. Marimuthu', route: 'R-TVL-1', status: 'Active', lat: 8.7037, lng: 77.7247, city: 'thirunelveli', occupancy: 'Full', nextStop: 'Junction', nextStopETA: 10 },
    { busNumber: 'TN 72 V 6767', driver: 'S. Sankaran', route: 'R-TVL-1', status: 'Active', lat: 8.71, lng: 77.73, city: 'thirunelveli', occupancy: 'Half-Full', nextStop: 'Palayamkottai', nextStopETA: 8 },
];

const routes = [
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

const alerts = [
  { type: 'SOS', busNumber: 'TN 45 D 9012', message: 'Mechanical issue reported.' },
  { type: 'Delayed', busNumber: 'TN 66 S 3434', message: 'Heavy traffic on Gandhipuram flyover.' },
  { type: 'Inactive', busNumber: 'TN 33 J 4455', message: 'Bus offline for 30 minutes.' },
  { type: 'Delayed', busNumber: 'TN 30 K 5566', message: 'Tyre puncture reported.' },
];


async function seedDatabase() {
  const batch = writeBatch(db);

  // Seed organizations
  const organizations = [
    'trichy',
    'tanjavur',
    'erode',
    'salem',
    'madurai',
    'dindigul',
    'thindivanam',
    'coimbatore',
    'kanyakumari',
    'thirunelveli',
  ];
  const organizationsCollection = collection(db, 'organizations');
  console.log('Seeding organizations...');
  organizations.forEach(org => {
    const docRef = doc(organizationsCollection, org);
    batch.set(docRef, { name: org, createdAt: Timestamp.now() });
  });
  console.log('Organizations prepared.');


  // Seed stops
  const stopsCollection = collection(db, 'stops');
  console.log('Seeding stops...');
  stops.forEach(stop => {
      const { stop_id, ...stopData } = stop;
      if (stop_id) {
        const docRef = doc(stopsCollection, stop_id);
        batch.set(docRef, stopData);
      }
  });
  console.log('Stops prepared.');

  // Seed routes
  const routesCollection = collection(db, 'routes');
  console.log('Seeding routes...');
  routes.forEach(route => {
    const docRef = doc(routesCollection); // Auto-generate ID for each route segment
    batch.set(docRef, route);
  });
  console.log('Routes prepared.');

  // Seed buses
  const busesCollection = collection(db, 'buses');
  console.log('Seeding buses...');
  buses.forEach((bus, index) => {
    const docRef = doc(busesCollection, `bus_${index + 1}`);
    batch.set(docRef, bus);
  });
  console.log('Buses prepared.');

  // Seed alerts
  const alertsCollection = collection(db, 'alerts');
  console.log('Seeding alerts...');
  alerts.forEach(alert => {
    const docRef = doc(alertsCollection);
    // Create a realistic timestamp
    const alertTimestamp = Timestamp.fromDate(new Date(Date.now() - Math.random() * 1000 * 60 * 15));
    batch.set(docRef, { ...alert, timestamp: alertTimestamp });
  });
  console.log('Alerts prepared.');

  // Seed drivers
  const driversCollection = collection(db, 'drivers');
  console.log('Seeding drivers...');
  drivers.forEach(driver => {
    const docRef = doc(driversCollection); // Auto-generate ID
    batch.set(docRef, { ...driver, createdAt: Timestamp.now() });
  });
  console.log('Drivers prepared.');

  try {
    await batch.commit();
    console.log('Database seeded successfully with organizations, stops, routes, buses, alerts, and drivers!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Firebase connections can keep the script running. We need to exit explicitly.
    process.exit(0);
  }
}

seedDatabase();

    
    
