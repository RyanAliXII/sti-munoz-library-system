import { ReactNode } from "react";

export type BaseProps = {
  children?: ReactNode;
};
export interface PublicRouteProps extends BaseProps {
  restricted: boolean;
}


