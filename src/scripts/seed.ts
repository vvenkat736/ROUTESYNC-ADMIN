

// A script to seed the Firestore database with initial data.
// To run this script, ensure you have ts-node installed (npm install -g ts-node)
// and your Firebase project is initialized.
// Then run: ts-node scripts/seed.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, Timestamp, doc } from 'firebase/firestore';
import { buses, alerts as staticAlerts, stops, routes } from '../lib/data';

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
    { driverId: 'D-TR-001', name: 'Muthu Kumar', phoneNumber: '9876543210', city: 'trichy' },
    { driverId: 'D-TR-002', name: 'Ravi Suresh', phoneNumber: '9876543211', city: 'trichy' },
    { driverId: 'D-TR-003', name: 'Arun Vijay', phoneNumber: '9876543212', city: 'trichy' },
    { driverId: 'D-TR-004', name: 'Gopal Ramesh', phoneNumber: '9876543213', city: 'trichy' },
    { driverId: 'D-TR-005', name: 'Senthil Karthik', phoneNumber: '9876543214', city: 'trichy' },
    // Tanjavur
    { driverId: 'D-TJ-001', name: 'Anand Balaji', phoneNumber: '9876543215', city: 'tanjavur' },
    { driverId: 'D-TJ-002', name: 'Karthik Vignesh', phoneNumber: '9876543216', city: 'tanjavur' },
    { driverId: 'D-TJ-003', name: 'Prakash Anand', phoneNumber: '9876543217', city: 'tanjavur' },
    { driverId: 'D-TJ-004', 'name': 'Mohan Rajesh', phoneNumber: '9876543218', city: 'tanjavur' },
    { driverId: 'D-TJ-005', name: 'Siva Prabhu', phoneNumber: '9876543219', city: 'tanjavur' },
    // Erode
    { driverId: 'D-ER-001', name: 'Naveen Senthil', phoneNumber: '9876543220', city: 'erode' },
    { driverId: 'D-ER-002', name: 'Thirunavukkarasu Saravanan', phoneNumber: '9876543221', city: 'erode' },
    { driverId: 'D-ER-003', name: 'Lakshmanan Manikandan', phoneNumber: '9876543222', city: 'erode' },
    { driverId: 'D-ER-004', name: 'Vetrivel Dinesh', phoneNumber: '9876543223', city: 'erode' },
    { driverId: 'D-ER-005', name: 'Chandran Murugan', phoneNumber: '9876543224', city: 'erode' },
    // Salem
    { driverId: 'D-SL-001', name: 'Dharma Selvam', phoneNumber: '9876543225', city: 'salem' },
    { driverId: 'D-SL-002', name: 'Jagan Prakash', phoneNumber: '9876543226', city: 'salem' },
    { driverId: 'D-SL-003', name: 'Bala Vinoth', phoneNumber: '9876543227', city: 'salem' },
    { driverId: 'D-SL-004', name: 'Hari Aravind', phoneNumber: '9876543228', city: 'salem' },
    { driverId: 'D-SL-005', name: 'Easwaran Gowtham', phoneNumber: '9876543229', city: 'salem' },
    // Madurai
    { driverId: 'D-MD-001', name: 'Pandian Pandi', phoneNumber: '9876543230', city: 'madurai' },
    { driverId: 'D-MD-002', name: 'Marimuthu Muthu', phoneNumber: '9876543231', city: 'madurai' },
    { driverId: 'D-MD-003', name: 'Karuppasamy K', phoneNumber: '9876543232', city: 'madurai' },
    { driverId: 'D-MD-004', name: 'Saravanan Ganesan', phoneNumber: '9876543233', city: 'madurai' },
    { driverId: 'D-MD-005', name: 'Velmurugan Velu', phoneNumber: '9876543234', city: 'madurai' },
    // Dindigul
    { driverId: 'D-DG-001', name: 'Raja Baskar', phoneNumber: '9876543235', city: 'dindigul' },
    { driverId: 'D-DG-002', name: 'Suresh Solomon', phoneNumber: '9876543236', city: 'dindigul' },
    { driverId: 'D-DG-003', name: 'Arul Antony', phoneNumber: '9876543237', city: 'dindigul' },
    { driverId: 'D-DG-004', name: 'Mani Mariappan', phoneNumber: '9876543238', city: 'dindigul' },
    { driverId: 'D-DG-005', name: 'Thangaraj Thomas', phoneNumber: '9876543239', city: 'dindigul' },
    // Thindivanam
    { driverId: 'D-TV-001', name: 'Govind Ganesh', phoneNumber: '9876543240', city: 'thindivanam' },
    { driverId: 'D-TV-002', name: 'Krishna Kumar', phoneNumber: '9876543241', city: 'thindivanam' },
    { driverId: 'D-TV-003', name: 'Venkatesh V', phoneNumber: '9876543242', city: 'thindivanam' },
    { driverId: 'D-TV-004', name: 'Raghavan Raghu', phoneNumber: '9876543243', city: 'thindivanam' },
    { driverId: 'D-TV-005', name: 'Murugan Mohan', phoneNumber: '9876543244', city: 'thindivanam' },
    // Coimbatore
    { driverId: 'D-CB-001', name: 'Palanisamy P', phoneNumber: '9876543245', city: 'coimbatore' },
    { driverId: 'D-CB-002', name: 'Chidambaram Chinnasamy', phoneNumber: '9876543246', city: 'coimbatore' },
    { driverId: 'D-CB-003', name: 'Ramasamy R', phoneNumber: '9876543247', city: 'coimbatore' },
    { driverId: 'D-CB-004', name: 'Kandasamy K', phoneNumber: '9876543248', city: 'coimbatore' },
    { driverId: 'D-CB-005', name: 'Subramaniam S', phoneNumber: '9876543249', city: 'coimbatore' },
    // Kanyakumari
    { driverId: 'D-KK-001', name: 'Selvam Murugan', phoneNumber: '9876543250', city: 'kanyakumari' },
    { driverId: 'D-KK-002', name: 'Jeyaraj J', phoneNumber: '9876543251', city: 'kanyakumari' },
    { driverId: 'D-KK-003', name: 'Aravind Arul', phoneNumber: '9876543252', city: 'kanyakumari' },
    { driverId: 'D-KK-004', name: 'Parthiban Peter', phoneNumber: '9876543253', city: 'kanyakumari' },
    { driverId: 'D-KK-005', name: 'Naveen Nelson', phoneNumber: '9876543254', city: 'kanyakumari' },
    // Thirunelveli
    { driverId: 'D-TVL-001', name: 'Madasamy Marimuthu', phoneNumber: '9876543255', city: 'thirunelveli' },
    { driverId: 'D-TVL-002', name: 'Sankaralingam Sankaran', phoneNumber: '9876543256', city: 'thirunelveli' },
    { driverId: 'D-TVL-003', name: 'Alagan Ayyanar', phoneNumber: '9876543257', city: 'thirunelveli' },
    { driverId: 'D-TVL-004', name: 'Kasirajan K', phoneNumber: '9876543258', city: 'thirunelveli' },
    { driverId: 'D-TVL-005', name: 'Veeramani V', phoneNumber: '9876543259', city: 'thirunelveli' },
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
  staticAlerts.forEach(alert => {
    const { id, timestamp, ...alertData } = alert;
    const docRef = doc(alertsCollection);
    // Create a realistic timestamp
    const alertTimestamp = Timestamp.fromDate(new Date(Date.now() - Math.random() * 1000 * 60 * 15));
    batch.set(docRef, { ...alertData, timestamp: alertTimestamp });
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
