import { Navigate, Outlet } from "react-router-dom";

import { useMsal } from "@azure/msal-react";
const ProtectedRoutes = () => {
  const { instance } = useMsal();
  if (instance.getActiveAccount())
    return (
      <></>
      // <AdminBaseLayout>
      //   <Outlet />
      // </AdminBaseLayout>
    );
  return <Navigate to={"/"} />;
};

export default ProtectedRoutes;
