import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@contexts/AuthContext";
import AdminBaseLayout from "@layouts/AdminBaseLayout";
import { useMsal } from "@azure/msal-react";
import NavbarSidebarLayout from "@layouts/NavbarSidebarLayout";
const ProtectedRoutes = () => {
  const { instance } = useMsal();
  if (instance.getActiveAccount())
    return (
      <NavbarSidebarLayout isFooter={false}>
        <Outlet></Outlet>
      </NavbarSidebarLayout>
    );
  // <AdminBaseLayout>
  //   <Outlet />
  // </AdminBaseLayout>
  return <Navigate to={"/"} />;
};

export default ProtectedRoutes;
