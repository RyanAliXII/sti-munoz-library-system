import { useMsal } from "@azure/msal-react";
import ScrollToTop from "@components/ScrollToTop";
import BaseLayout from "@layouts/BaseLayout";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes = () => {
  const { instance } = useMsal();
  if (instance.getActiveAccount())
    return (
      <BaseLayout>
        <ScrollToTop/>
        <Outlet />
      </BaseLayout>
    );
  return <Navigate to={"/"} />;
};

export default ProtectedRoutes;
