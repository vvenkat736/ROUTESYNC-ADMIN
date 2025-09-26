
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-1144301721-8385a",
  appId: "1:488781451659:web:aba6bbee8a3b849ef1df8e",
  apiKey: "AIzaSyCpGambMSm71fLy3uqR0Akjx91qxekpAdA",
  authDomain: "studio-1144301721-8385a.firebaseapp.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
