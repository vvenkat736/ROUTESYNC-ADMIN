
// A script to seed the Firestore database with initial data.
// To run this script, ensure you have ts-node installed (npm install -g ts-node)
// and your Firebase project is initialized.
// Then run: ts-node scripts/seed.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, Timestamp, doc } from 'firebase/firestore';
import { buses, alerts as staticAlerts, routes } from '../src/lib/data';

// IMPORTANT: Replace with your actual Firebase project configuration
const firebaseConfig = {
  projectId: "studio-1144301721-8385a",
  appId: "1:488781451659:web:aba6bbee8a3b849ef1df8e",
  apiKey: "AIzaSyCpGambMSm71fLy3uqR0Akjx91qxekpAdA",
  authDomain: "studio-1144301721-8385a.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
  const batch = writeBatch(db);

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

    // Seed routes
    const routesCollection = collection(db, 'routes');
    console.log('Seeding routes...');
    routes.forEach(route => {
        const { id, ...routeData } = route;
        const docRef = doc(routesCollection, String(id));
        batch.set(docRef, routeData);
    });
    console.log('Routes prepared.');

  try {
    await batch.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Firebase connections can keep the script running. We need to exit explicitly.
    process.exit(0);
  }
}

seedDatabase();
