import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: "candidate" | "company";
};

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!isLoggedIn || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    if (currentUser.role === "candidate") {
      return <Navigate to="/candidate-dashboard" replace />;
    }
    if (currentUser.role === "company") {
      return <Navigate to="/company-dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
