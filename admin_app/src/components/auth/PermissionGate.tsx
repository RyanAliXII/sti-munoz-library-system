import { useAuthContext } from "@contexts/AuthContext";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type PermissionGateProps = {
  requiredPermissions?: string[];
  children?: ReactNode;
};
const PermissionGate = ({
  requiredPermissions = [],
  children,
}: PermissionGateProps) => {
  const { hasPermissions } = useAuthContext();
  if (hasPermissions(requiredPermissions)) {
    return <>{children}</>;
  }
  return <Navigate to={"/forbidden"} />;
};

export default PermissionGate;
