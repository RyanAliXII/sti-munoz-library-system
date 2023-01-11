import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

const ProtectedRoutes = () => {
  const { authenticated } = useAuthContext();
  if (authenticated) return <Outlet />;
  return <Navigate to={"/login"} />;
};

export default ProtectedRoutes;
