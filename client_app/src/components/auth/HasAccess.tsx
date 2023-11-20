import { useAuthContext } from "@contexts/AuthContext";
import { ReactNode } from "react";

type HasPermissionProps = {
  children?: ReactNode;
};
const HasAccess = ({
  children,
}: HasPermissionProps) => {
    return <>{children}</>;
};

export default HasAccess;
