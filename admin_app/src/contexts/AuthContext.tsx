import { createContext, useContext, useEffect, useState } from "react";
import { BaseProps } from "@definitions/props.definition";
import { useMsal } from "@azure/msal-react";
import Loader from "@components/Loader";
import axios from "axios";
import { Account, Role, User } from "@definitions/types";
import {
  AccountInfo,
  EventType,
  EventMessage,
  AuthenticationResult,
} from "@azure/msal-browser";
import { MS_GRAPH_SCOPE, SCOPES } from "@definitions/configs/msal/scopes";
import axiosClient from "@definitions/configs/axios";

export const AuthContext = createContext({} as AuthContextState);
export const useAuthContext = () => {
  return useContext(AuthContext);
};
export type AuthContextState = {
  authenticated: boolean;
  setAuthenticated: Function;
  loading?: boolean;
  user: User;
  hasPermissions: (requiredPermissions: string[]) => boolean;
};

export const AuthProvider = ({ children }: BaseProps) => {
  const { instance: msalClient } = useMsal();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({} as User);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const useAccountFromStorage = async () => {
    try {
      if (msalClient.getAllAccounts().length > 0) {
        const account = msalClient.getAllAccounts()[0];

        const tokens = await msalClient.acquireTokenSilent({
          scopes: MS_GRAPH_SCOPE,
        });

        await useAccount(account, tokens.accessToken);
      } else {
        throw new Error("NO ACCOUNTS");
      }
    } catch (error) {
      logout();
    }
  };

  const useAccount = async (account: AccountInfo | null, accessToken = "") => {
    try {
      if (account && accessToken.length > 0) {
        msalClient.setActiveAccount(account);
        const user = await fetchUser(accessToken);
        const accountData: Account = {
          id: user.data.id,
          displayName: user.data.displayName,
          email: user.data.mail,
          givenName: user.data.givenName,
          surname: user.data.surname,
        };
        await verifyAccount(accountData);
        await getRolePermissions();
        setAuthenticated(true);
        return;
      }
    } catch (error) {
      throw error;
    }
  };

  const verifyAccount = async (account: Account) => {
    try {
      const tokens = await msalClient.acquireTokenSilent({
        scopes: [SCOPES.library.access],
      });
      await axiosClient.post("/accounts/verification", account, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
    } catch (error) {
      console.error("Failed to verify user.");
      throw error;
    }
  };

  const getRolePermissions = async () => {
    try {
      const tokens = await msalClient.acquireTokenSilent({
        scopes: [SCOPES.library.access],
      });

      const { data: response } = await axiosClient.get(
        `/accounts/roles/${tokens.account?.localAccountId}}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      if (!response.data.role) return;
      const role: Role = response.data.role;
      const permissionsArr = Object.keys(role.permissions).reduce<string[]>(
        (a, moduleName) => [...a, ...role.permissions[moduleName]],
        []
      );
      setPermissions(permissionsArr);
    } catch (error) {
      console.error("Failed to fetch permissions.");
      throw error;
    }
  };

  const hasPermissions = (requredPermissions: string[]) => {
    // if empty array is given, it means accessing module doesnt not require any permissions for access.
    if (requredPermissions.length === 0) {
      return true;
    }
    for (const p of requredPermissions) {
      if (permissions.includes(p)) {
        return true;
      }
    }
    return false;
  };

  const logout = async () => {
    const account = msalClient.getActiveAccount();
    if (account) {
      await msalClient.logout({
        account: account,
        logoutHint: account?.idTokenClaims?.login_hint,
      });
    }
    localStorage.clear();
  };

  const fetchUser = async (accessToken: string) => {
    const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setUser({
      email: response.data.mail,
      firstname: response.data.givenName,
      lastname: response.data.surname,
      id: response.data.id,
    });
    return response;
  };

  const subscribeMsalEvent = () => {
    msalClient.enableAccountStorageEvents();
    const callbackId = msalClient.addEventCallback((message: EventMessage) => {
      if (message.eventType === EventType.INITIALIZE_START) {
        init();
      }
      if (message.eventType === EventType.LOGIN_SUCCESS) {
        const payload: AuthenticationResult =
          message.payload as AuthenticationResult;
        useAccount(payload.account, payload.accessToken);
      }
      if (message.eventType === EventType.LOGIN_FAILURE) {
        console.log(message.error);
      }
    });
    return callbackId;
  };
  const unsubscribeMsalEvent = (id: string | null) => {
    msalClient.disableAccountStorageEvents();
    if (id) {
      msalClient.removeEventCallback(id);
    }
  };
  const init = async () => {
    await useAccountFromStorage();
    setLoading(false);
  };
  useEffect(() => {
    const id = subscribeMsalEvent();
    return () => {
      unsubscribeMsalEvent(id);
    };
  }, []);
  return (
    <AuthContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        user,

        hasPermissions,
      }}
    >
      {!loading ? children : <Loader />}
    </AuthContext.Provider>
  );
};
