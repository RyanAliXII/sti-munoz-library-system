import { useMsal } from "@azure/msal-react";
import NavbarSidebarLayout from "@layouts/NavbarSidebarLayout";
import { Navigate, Outlet } from "react-router-dom";
const ProtectedRoutes = () => {
  const { instance } = useMsal();
  if (instance.getActiveAccount())
    return (
      <NavbarSidebarLayout isFooter={false}>
        <Outlet></Outlet>
      </NavbarSidebarLayout>
    );
  return <Navigate to={"/"} />;
};

export default ProtectedRoutes;
