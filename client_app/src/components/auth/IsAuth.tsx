import { useMsal } from "@azure/msal-react";
import React, { ReactElement, ReactNode } from "react";

type isAuthProps = {
  fallback?: ReactNode | ReactNode[] | ReactElement | ReactElement[];
  children?: ReactNode;
};
const IsAuth = ({ children, fallback }: isAuthProps) => {
  const { instance } = useMsal();

  if (instance.getActiveAccount()) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};

export default IsAuth;
