import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, getDocFromServer, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType, sanitizeFirestoreData } from '../lib/firebaseUtils';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  userData: any;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let unsubDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Clean up previous doc listener if any
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (user) {
        // Real-time listener for user document to handle race conditions and updates
        const userDocRef = doc(db, 'users', user.uid);
        unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (!isMounted) return;
          if (docSnap.exists()) {
            setUserData(sanitizeFirestoreData(docSnap.data()));
          } else {
            // Default to patient if doc doesn't exist yet (signup in progress)
            setUserData({ uid: user.uid, email: user.email, role: 'patient', isNew: true });
          }
          setCurrentUser(user);
          setLoading(false);
        }, (error) => {
          console.error("User doc listener error:", error);
          if (isMounted) {
            setCurrentUser(user);
            setLoading(false);
          }
        });
      } else {
        if (isMounted) {
          setUserData(null);
          setCurrentUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookie if any
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const value = {
    currentUser,
    loading,
    userData,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
