import { useAuthContext } from "@contexts/AuthContext";
import { ReactNode } from "react";

type HasNoPermissionProps = {
  nonExistingPermissions?: string[];
  children?: ReactNode;
};
const HasNoAccess = ({
  nonExistingPermissions = [],
  children,
}: HasNoPermissionProps) => {
  const { hasPermissions } = useAuthContext();
  if (!hasPermissions(nonExistingPermissions)) {
    return <>{children}</>;
  }
  return null;
};

export default HasNoAccess;
