import { useAuthContext } from "@contexts/AuthContext";
import { ReactNode } from "react";

type HasPermissionProps = {
  requiredPermissions?: string[];
  children?: ReactNode;
};
const HasAccess = ({
  requiredPermissions = [],
  children,
}: HasPermissionProps) => {
  const { hasPermissions } = useAuthContext();
  if (hasPermissions(requiredPermissions)) {
    return <>{children}</>;
  }
  return null;
};

export default HasAccess;
