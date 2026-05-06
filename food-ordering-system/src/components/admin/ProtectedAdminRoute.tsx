import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedRouteProps) {
  const adminUser = localStorage.getItem("adminUser");

  if (!adminUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
