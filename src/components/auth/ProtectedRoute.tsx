
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If authentication check is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
    
    // If role is required and user doesn't have it
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, requiredRole, user]);

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-primary border-solid mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication and role checks pass, render children
  if (isAuthenticated && (!requiredRole || user?.role === requiredRole)) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}
