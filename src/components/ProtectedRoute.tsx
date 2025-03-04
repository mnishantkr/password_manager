
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isVaultSetup } from '@/utils/storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresAuth = true,
  redirectTo 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if the vault is set up
    const vaultSetup = isVaultSetup();
    setIsSetup(vaultSetup);
    
    // Consider authenticated if we're in the encryption context
    // In a real app, you'd check the auth state properly
    const encryptionKeyAvailable = localStorage.getItem('encryptionKeyAvailable') === 'true';
    setIsAuthenticated(encryptionKeyAvailable);
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If vault isn't set up at all, redirect to setup
  if (!isSetup && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  // If vault is set up but the user isn't authenticated, redirect to login
  if (requiresAuth && !isAuthenticated && isSetup) {
    return <Navigate to={redirectTo || "/login"} replace state={{ from: location }} />;
  }

  // If the user is authenticated but accessing login or setup, redirect to dashboard
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/setup')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
