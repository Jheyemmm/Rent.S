
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import supabase from '../supabaseClient';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        
        if (!authData.user) {
          setIsAuthenticated(false);
          return;
        }
        
        const { data: userData } = await supabase
          .from('Users')
          .select('RoleID')
          .eq('Email', authData.user.email)
          .single();
          
        if (!userData) {
          setIsAuthenticated(false);
          return;
        }
        
        // Get role name from RoleID
        const { data: roleData } = await supabase
          .from('Roles')
          .select('Role')
          .eq('RoleID', userData.RoleID)
          .single();
          
        if (!roleData) {
          setIsAuthenticated(false);
          return;
        }
        
        setUserRole(roleData.Role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(userRole || '');
  
  // Redirect to unauthorized page if user doesn't have required role
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // Render the child routes
  return <Outlet />;
};

export default ProtectedRoute;