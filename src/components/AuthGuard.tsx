'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/services/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip authentication check for the login page
    if (pathname === '/login') {
      setIsChecking(false);
      return;
    }

    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }

      // Check if user has admin role
      const user = getCurrentUser();
      if (!user || user.role !== 'admin') {
        // Clear any existing auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      // User is authenticated and has admin role
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Show nothing while checking authentication
  if (isChecking && pathname !== '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
