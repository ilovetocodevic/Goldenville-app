import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebaseConfig'; // Adjusted path to firebaseConfig

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null; // To store role and other details from Firestore
  isLoading: boolean;
  logout: () => Promise<void>;
}

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | string; // string for flexibility if roles expand
  class?: string; // For students
  subjects?: string[]; // For teachers
  // Add other profile fields as needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setCurrentUser(user);
        // Fetch user profile from Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        } else {
          // Handle case where user exists in Auth but not Firestore (should not happen with current signup)
          console.error("User profile not found in Firestore for UID:", user.uid);
          setUserProfile(null); // Or set a default/error state
          // Consider logging out the user here if profile is essential
          // await signOut(auth);
          // setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // currentUser and userProfile will be set to null by onAuthStateChanged listener
    } catch (error) {
      console.error("Error logging out: ", error);
      // Optionally, handle logout errors (e.g., show an alert)
    } finally {
      // Ensure loading is false even if onAuthStateChanged is slow or logout fails
      // Though onAuthStateChanged should handle setting user to null and thus loading to false eventually
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
