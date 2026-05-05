import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Create user doc if it doesn't exist
            const newUserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'User',
              role: 'Patient', // Default role
              createdAt: serverTimestamp() // Use serverTimestamp for consistency
            };
            try {
              await setDoc(doc(db, 'users', user.uid), newUserData);
              setUserData({ ...newUserData, createdAt: new Date().toISOString() }); // Local fallback for immediate use
            } catch (createErr) {
              console.error("Failed to create user document:", createErr);
              // Don't throw here, just set minimal user data
              setUserData(newUserData);
            }
          }
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          if (error.code === 'permission-denied') {
             // If permission denied, we still want the app to load, maybe with a warning
             setUserData({ uid: user.uid, email: user.email, role: 'Patient', permissionError: true });
          } else {
             handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          }
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
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
