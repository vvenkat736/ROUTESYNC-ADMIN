
// A script to seed the Firestore database with initial data.
// To run this script, ensure you have ts-node installed (npm install -g ts-node)
// and your Firebase project is initialized.
// Then run: ts-node scripts/seed.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, Timestamp, doc } from 'firebase/firestore';
import { buses, alerts as staticAlerts, stops, routes } from '../src/lib/data';

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
    { driverId: 'D001', name: 'M. Kumar', phoneNumber: '9876543210', city: 'trichy' },
    { driverId: 'D002', name: 'S. Priya', phoneNumber: '9876543211', city: 'trichy' },
    { driverId: 'D003', name: 'R. Suresh', phoneNumber: '9876543212', city: 'trichy' },
    { driverId: 'D004', name: 'K. Anitha', phoneNumber: '9876543213', city: 'trichy' },
    { driverId: 'D005', name: 'V. Arun', phoneNumber: '9876543214', city: 'trichy' },
    { driverId: 'D006', name: 'P. Pandi', phoneNumber: '9876543215', city: 'madurai' },
    { driverId: 'D007', name: 'L. Lakshmi', phoneNumber: '9876543216', city: 'dindigul' },
    { driverId: 'D008', name: 'G. Ganesh', phoneNumber: '9876543217', city: 'thindivanam' },
    { driverId: 'D009', name: 'A. Devi', phoneNumber: '9876543218', city: 'coimbatore' },
    { driverId: 'D010', name: 'S. Murugan', phoneNumber: '9876543219', city: 'kanyakumari' },
    { driverId: 'D011', name: 'T. Meena', phoneNumber: '9876543220', city: 'thirunelveli' },
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
    const { id, ...busData } = bus;
    const docRef = doc(busesCollection, `bus_${index + 1}`);
    batch.set(docRef, busData);
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
