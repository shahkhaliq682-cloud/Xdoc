import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

console.log("FIRESTORE INIT - Project:", firebaseConfig.projectId);
console.log("FIRESTORE INIT - DB ID:", firebaseConfig.firestoreDatabaseId);

// Use memoryLocalCache to bypass persistence-related issues and ensure we are hitting the correct DB
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
}, '(default)');
// Note: experimentalForceLongPolling is not in the type definition for initializeFirestore in some versions but works
// We will stick to the basic initialization first as we suspects it's a rule deployment issue.

export default app;
