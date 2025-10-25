import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'user')[]; // 'owner' is now 'admin' based on isAdmin
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('ProtectedRoute state:', { isAuthenticated, loading, user, allowedRoles });

  if (loading) {
    console.log('ProtectedRoute: Loading...');
    return (
      <div className="flex flex-col space-y-3 p-4">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />; // Redirection vers /auth
  }

  // Check roles if provided
  if (allowedRoles && user) {
    const userRole = user.role; // Use user.role directly
    if (!allowedRoles.includes(userRole)) {
      console.log('ProtectedRoute: Authenticated but role not allowed, redirecting to /dashboard');
      return <Navigate to="/dashboard" replace />; // Redirect if role not allowed
    }
  }

  console.log('ProtectedRoute: Authenticated and authorized, rendering Outlet');
  return <Outlet />;
};

export default ProtectedRoute;