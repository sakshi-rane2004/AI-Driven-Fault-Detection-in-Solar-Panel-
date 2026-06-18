import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getCurrentUser, isAuthenticated, hasRole, hasAnyRole } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Demo role switcher - allows switching between roles without login
  const switchRole = (role) => {
    const roleUsers = {
      'ADMIN': {
        id: 1,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@solarpanel.com',
        role: 'ADMIN'
      },
      'TECHNICIAN': {
        id: 2,
        username: 'technician',
        firstName: 'Tech',
        lastName: 'User',
        email: 'tech@solarpanel.com',
        role: 'TECHNICIAN'
      },
      'VIEWER': {
        id: 3,
        username: 'viewer',
        firstName: 'View',
        lastName: 'User',
        email: 'viewer@solarpanel.com',
        role: 'VIEWER'
      }
    };

    setUser(roleUsers[role]);
  };

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsLoggedIn(true);

            // Validate token with server
            try {
              await authAPI.validateToken();
            } catch (error) {
              console.error('Token validation failed:', error);
              logout();
            }
          }
        }
        // Removed auto-login - users must select role on login page
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);

      setUser(response);
      setIsLoggedIn(true);

      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, useAdminEndpoint = false) => {
    try {
      setLoading(true);
      const response = useAdminEndpoint
        ? await authAPI.registerAsAdmin(userData)
        : await authAPI.register(userData);
      setUser(response);
      setIsLoggedIn(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      // Clear any stored tokens or session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Role-based access control helpers
  const userHasRole = (role) => {
    return user && user.role === role;
  };

  const userHasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const isAdmin = () => {
    return userHasRole('ADMIN');
  };

  const isTechnician = () => {
    return userHasRole('TECHNICIAN');
  };

  const isViewer = () => {
    return userHasRole('VIEWER');
  };

  // Access control — all logged-in users get full access to their own data
  const canAccessAnalytics = () => !!user;
  const canAccessHistory = () => !!user;
  const canAnalyze = () => !!user;
  const canAccessPanels = () => !!user;
  const canAccessAlerts = () => !!user;
  const canAccessSettings = () => isAdmin();
  const canAccessUserManagement = () => isAdmin();
  const canAssignWork = () => isAdmin();
  const hasFullAccess = () => isAdmin();

  const value = {
    user,
    loading,
    isLoggedIn,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    switchRole, // Add role switcher for demo
    userHasRole,
    userHasAnyRole,
    isAdmin,
    isTechnician,
    isViewer,
    canAccessAnalytics,
    canAccessHistory,
    canAnalyze,
    canAccessPanels,
    canAccessAlerts,
    canAccessSettings,
    canAccessUserManagement,
    canAssignWork,
    hasFullAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};