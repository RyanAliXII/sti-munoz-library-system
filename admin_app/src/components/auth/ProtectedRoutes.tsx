import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@contexts/AuthContext";
import AdminBaseLayout from "@layouts/AdminBaseLayout";
import { useMsal } from "@azure/msal-react";
const ProtectedRoutes = () => {
  const { instance } = useMsal();
  if (instance.getActiveAccount())
    return (
      <AdminBaseLayout>
        <Outlet />
      </AdminBaseLayout>
    );
  return <Navigate to={"/"} />;
};

export default ProtectedRoutes;
