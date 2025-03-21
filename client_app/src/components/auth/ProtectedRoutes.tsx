import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import { useMsal } from "@azure/msal-react";
import BaseLayout from "@layouts/BaseLayout";

const ProtectedRoutes = () => {
  const { instance } = useMsal();
  if (instance.getActiveAccount())
    return (
      <BaseLayout>
        <Outlet />
      </BaseLayout>
    );
  return <Navigate to={"/"} />;
};

export default ProtectedRoutes;
