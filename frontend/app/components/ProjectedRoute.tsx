import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { authService } from "~/services/authService";

interface ProjectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProjectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = "/" 
}: ProjectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProjectedRoute;
