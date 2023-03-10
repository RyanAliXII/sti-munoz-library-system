import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@contexts/AuthContext";
import { PublicRouteProps } from "@definitions/props.definition";
import { useMsal } from "@azure/msal-react";
const PublicRoutes = ({ restricted }: PublicRouteProps) => {
  const { instance } = useMsal();
  if (instance.getActiveAccount() && restricted)
    return <Navigate to={"/dashboard"} />;
  return <Outlet />;
};

export default PublicRoutes;
