import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children }: { children?: ReactNode }) => {
  const { isAuth } = useAuth();
  if (!isAuth) return <Navigate to="/" />;
  return children;
};

export default PrivateRoute;
