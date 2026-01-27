import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: '1036653037148-vl6610nisp1kghbe26fsaafvj01obe5k.apps.googleusercontent.com',
  webClientId: '1036653037148-vl6610nisp1kghbe26fsaafvj01obe5k.apps.googleusercontent.com',
  androidClientId: '1036653037148-vl6610nisp1kghbe26fsaafvj01obe5k.apps.googleusercontent.com',
});


useEffect(() => {
  if (response?.type === 'success') {
    const idToken = response.authentication?.idToken;

    if (!idToken) return;

    const credential = GoogleAuthProvider.credential(idToken);
    signInWithCredential(auth, credential);
  }
}, [response]);


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
  const loginWithGoogle = () => promptAsync();

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
  loginWithGoogle,
  logout,
  isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
