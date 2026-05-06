import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjzfYoS-Oq7HAkvhczN0rDu37JKd_HzrU",
  authDomain: "xdoc-d67b6.firebaseapp.com",
  projectId: "xdoc-d67b6",
  storageBucket: "xdoc-d67b6.firebasestorage.app",
  messagingSenderId: "716380019110",
  appId: "1:716380019110:web:39cc7187a61cee0297d767",
  measurementId: "G-ZPCTCP1WSM"
};

// Initialize only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use memoryLocalCache to bypass persistence-related issues
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});

export default app;
