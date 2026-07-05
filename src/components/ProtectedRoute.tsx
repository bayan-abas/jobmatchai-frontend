import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: "candidate" | "company";
};

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === "candidate") {
      return <Navigate to="/candidate-dashboard" replace />;
    }
    if (user.role === "company") {
      return <Navigate to="/company-dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
