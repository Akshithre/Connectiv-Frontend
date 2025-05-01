// src/contexts/authContext/index.jsx
import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(() => {
    // Initialize from localStorage if available
    const savedDetails = localStorage.getItem('userDetails');
    return savedDetails ? JSON.parse(savedDetails) : null;
  });

  const updateUserDetails = (details) => {
    setUserDetails(details);
    if (details) {
      localStorage.setItem('userDetails', JSON.stringify(details));
      setUserLoggedIn(true);
    } else {
      localStorage.removeItem('userDetails');
      setUserLoggedIn(false);
    }
  };
  const logout = () => {
    localStorage.removeItem('userDetails');
    setUserDetails(null);
    setUserLoggedIn(false);
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          setUserLoggedIn(true);
          
          // Only fetch user details if we don't have them or email doesn't match
          if (!userDetails || userDetails.email !== user.email) {
            const details = await fetchUserDetails(user.email);
            if (details) {
              updateUserDetails(details);
            }
          }
        } else {
          setCurrentUser(null);
          setUserLoggedIn(false);
          updateUserDetails(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Cleanup function for logout
  

  const value = {
    userLoggedIn,
    userDetails,
    setUserDetails: updateUserDetails,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}