import { User } from "./configs/msal.config";
export type AuthContextState = {
  authenticated: boolean;
  setAuthenticated: Function;
  loading?: boolean;
  user: User;
};
