import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

console.log("Firebase Debug - Project ID:", firebaseConfig.projectId);
console.log("Firebase Debug - Database ID:", firebaseConfig.firestoreDatabaseId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use a very simple getFirestore first to see if it works
// We will try initializeFirestore if this still has persistence issues
export const db = getFirestore(app);

export default app;
