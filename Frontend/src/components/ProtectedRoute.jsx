import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, getRoleDashboardRoute } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-blue-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Authenticating ERP Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's authorized role dashboard if trying to access unauthorized route
    const targetRoute = getRoleDashboardRoute(user.role);
    return <Navigate to={targetRoute} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
