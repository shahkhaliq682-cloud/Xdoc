import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjzfYoS-Oq7HAkvhczN0rDu37JKd_HzrU",
  authDomain: "xdoc-d67b6.firebaseapp.com",
  projectId: "xdoc-d67b6",
  storageBucket: "xdoc-d67b6.firebasestorage.app",
  messagingSenderId: "716380019110",
  appId: "1:716380019110:web:39cc7187a61cee0297d767",
  measurementId: "G-ZPCTCP1WSM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
