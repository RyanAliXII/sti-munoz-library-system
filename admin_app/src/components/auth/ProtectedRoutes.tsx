import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@contexts/AuthContext";
import AdminBaseLayout from "@layouts/AdminBaseLayout";
const ProtectedRoutes = () => {
  const { authenticated } = useAuthContext();
  if (authenticated)
    return (
      <AdminBaseLayout>
        <Outlet />
      </AdminBaseLayout>
    );
  return <Navigate to={"/"} />;
};

export default ProtectedRoutes;
