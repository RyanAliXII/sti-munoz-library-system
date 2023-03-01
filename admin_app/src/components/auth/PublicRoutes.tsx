import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@contexts/AuthContext";
import { PublicRouteProps } from "@definitions/props.definition";
const PublicRoutes = ({ restricted }: PublicRouteProps) => {
  const { authenticated } = useAuthContext();
  if (authenticated && restricted) return <Navigate to={"/dashboard"} />;
  return <Outlet />;
};

export default PublicRoutes;
