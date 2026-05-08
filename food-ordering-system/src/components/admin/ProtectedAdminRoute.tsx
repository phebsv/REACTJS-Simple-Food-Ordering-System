import { Navigate } from "react-router-dom";
import { getStoredItem } from "../../utils/storage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedRouteProps) {
  const adminUser = getStoredItem("adminUser");

  if (!adminUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
