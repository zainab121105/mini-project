import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Decode JWT to get user info
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Initialize state outside component to avoid re-renders
const getInitialState = () => {
  const storedToken = localStorage.getItem('token');
  const initialUser = storedToken ? decodeToken(storedToken) : null;
  return {
    token: storedToken || null,
    user: initialUser,
  };
};

export const AuthProvider = ({ children }) => {
  const initialState = getInitialState();
  const [user, setUser] = useState(initialState.user);
  const [token, setToken] = useState(initialState.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Token changed externally, decode it
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser(decoded);
      } else {
        // Invalid token
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, setToken, setUser, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
