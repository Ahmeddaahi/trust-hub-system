
import { extractTokenFromHeader, verifyAccessToken } from "../auth/authUtils";

export type AuthenticatedRequest = {
  userId?: string;
  userRole?: string;
};

export const checkAuth = (authHeader?: string): AuthenticatedRequest & { isAuthenticated: boolean } => {
  try {
    // Extract token
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return { isAuthenticated: false };
    }
    
    // Verify token
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      return { isAuthenticated: false };
    }
    
    // Return user info from token
    return {
      isAuthenticated: true,
      userId: payload.userId,
      userRole: payload.role
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
};

export const requireAuth = (authHeader?: string): AuthenticatedRequest & { isAuthenticated: boolean } => {
  const auth = checkAuth(authHeader);
  
  return auth;
};

export const requireRole = (authHeader?: string, requiredRole?: string): AuthenticatedRequest & { 
  isAuthenticated: boolean; 
  hasRequiredRole: boolean;
} => {
  const auth = checkAuth(authHeader);
  
  if (!auth.isAuthenticated || !requiredRole) {
    return { ...auth, hasRequiredRole: false };
  }
  
  return {
    ...auth,
    hasRequiredRole: auth.userRole === requiredRole
  };
};
