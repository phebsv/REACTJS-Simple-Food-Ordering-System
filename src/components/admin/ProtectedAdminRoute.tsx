import { Navigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
