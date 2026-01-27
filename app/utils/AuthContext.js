import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            const defaultData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || 'anonymous',
              role: 'user',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, defaultData);
            setUserData(defaultData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    const userDocRef = doc(db, 'users', newUser.uid);
    const defaultData = {
      uid: newUser.uid,
      email: email,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, defaultData);
    setUserData(defaultData);
    return userCredential;
  };

  const loginAnonymously = () => signInAnonymously(auth);
  const logout = () => signOut(auth);

  const isAdmin = userData?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      login, 
      register, 
      loginAnonymously, 
      logout, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
