import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const savedUser = localStorage.getItem('akg_admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('akg_admin_token') || null);
  const [loading, setLoading] = useState(false);

  const login = (userData, userToken) => {
    setAdmin(userData);
    setToken(userToken);
    localStorage.setItem('akg_admin_user', JSON.stringify(userData));
    localStorage.setItem('akg_admin_token', userToken);
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('akg_admin_user');
    localStorage.removeItem('akg_admin_token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
