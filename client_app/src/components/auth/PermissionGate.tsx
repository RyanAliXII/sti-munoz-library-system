import React, { Children, ReactNode } from "react";
import { Navigate } from "react-router-dom";

type PermissionGateProps = {
  children?: ReactNode;
};
const PermissionGate = ({
  children,
}: PermissionGateProps) => {

    return <>{children}</>;
};

export default PermissionGate;
