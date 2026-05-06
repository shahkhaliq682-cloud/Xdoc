import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, SDK_VERSION } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

console.log("Firebase SDK Version:", SDK_VERSION);
console.log("Firebase Debug - Project ID:", firebaseConfig.projectId);
console.log("Firebase Debug - Database ID:", firebaseConfig.firestoreDatabaseId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with memoryLocalCache to bypass persistence-related assertion errors (ID: ca9)
// and ensures we're connecting to the correct database instance from config
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
}, firebaseConfig.firestoreDatabaseId === '(default)' ? undefined : firebaseConfig.firestoreDatabaseId);

export default app;
