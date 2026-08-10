import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCredentials,
  logout as logoutAction,
  fetchCurrentUser,
  setAuthLoading,
} from '../store/slices/authSlice';

const AuthContext = createContext();

export const getRoleDashboardRoute = (role) => {
  switch (role) {
    case 'Super Admin':
      return '/dashboard/super-admin';
    case 'Company Admin':
      return '/dashboard/company-admin';
    case 'Sales Manager':
    case 'Sales Executive':
    case 'CRM Employee':
      return '/crm';
    case 'HR':
      return '/dashboard/hr';
    case 'Manager':
      return '/dashboard/manager';
    case 'Production Manager':
    case 'Production Employee':
      return '/manufacturing/production';
    case 'Purchase Manager':
    case 'Purchase Employee':
      return '/manufacturing/purchase';
    case 'Inventory Manager':
    case 'Inventory Employee':
      return '/manufacturing/inventory';
    case 'Warehouse Manager':
    case 'Warehouse Employee':
      return '/manufacturing/warehouses';
    case 'Maintenance Manager':
    case 'Maintenance Employee':
      return '/manufacturing/maintenance';
    case 'Finance':
    case 'Finance Manager':
    case 'Finance Employee':
      return '/payroll';
    case 'Team Leader':
      return '/dashboard/team-leader';
    case 'Employee':
    default:
      return '/dashboard/employee';
  }
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (storedToken && storedUser) {
        dispatch(fetchCurrentUser());
      } else {
        dispatch(setAuthLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  const loginUser = (userData, userToken, rememberMe = false) => {
    dispatch(setCredentials({ user: userData, token: userToken, rememberMe }));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginUser,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

