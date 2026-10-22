import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('driveeasy_customer');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('driveeasy_token') || null;
  });

  const login = (customerData, authToken) => {
    setCustomer(customerData);
    setToken(authToken);
    localStorage.setItem('driveeasy_customer', JSON.stringify(customerData));
    localStorage.setItem('driveeasy_token', authToken);
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem('driveeasy_customer');
    localStorage.removeItem('driveeasy_token');
  };

  return (
    <AuthContext.Provider value={{ customer, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
