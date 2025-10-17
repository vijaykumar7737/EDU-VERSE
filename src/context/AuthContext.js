import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const res = await authAPI.getProfile();
          setUser(res.data);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setError(err.response?.data?.msg || 'Authentication error');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      const res = await authAPI.register(formData);
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setError(null);
      return res.data.user;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await authAPI.login(formData);
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setError(null);
      return res.data.user;
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};