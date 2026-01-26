import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // For this app, we might want to sign in anonymously if not logged in
        // or just keep user as null and handle it in UI
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginAnonymously = () => signInAnonymously(auth);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, loginAnonymously, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
