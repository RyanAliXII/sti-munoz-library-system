import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import { useMsal } from "@azure/msal-react";
import AuthBaseLayout from "@layouts/AuthBaseLayout";

const ProtectedRoutes = () => {
  const { instance } = useMsal();
  if (instance.getActiveAccount())
    return (
      <AuthBaseLayout>
        <Outlet />
      </AuthBaseLayout>
    );
  return <Navigate to={"/"} />;
};

export default ProtectedRoutes;
