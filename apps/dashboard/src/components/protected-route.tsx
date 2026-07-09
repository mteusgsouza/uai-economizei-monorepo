import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/use-auth';
import { Spinner } from '@workspace/ui/components/spinner';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
