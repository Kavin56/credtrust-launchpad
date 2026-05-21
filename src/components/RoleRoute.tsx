import { Navigate } from "react-router-dom";
import { useAuth } from "@/modules/login/AuthContext";

type RoleRouteProps = {
  children: React.ReactNode;
  roles: string[];
  loginPath?: string;
  fallbackPath?: string;
};

export const RoleRoute = ({
  children,
  roles,
  loginPath = "/login",
  fallbackPath = "/",
}: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 border-2 border-[#1a1f36] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to={loginPath} replace />;
  if (!roles.includes(user.role)) return <Navigate to={fallbackPath} replace />;

  return <>{children}</>;
};

export default RoleRoute;
