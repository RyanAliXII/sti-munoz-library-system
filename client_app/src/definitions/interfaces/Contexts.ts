import { Account } from "@definitions/types";

export type AuthContextState = {
  authenticated: boolean;
  setAuthenticated: Function;
  loading?: boolean;
  user: Account;
};
