import { createContext, useContext, useEffect, useState } from "react";
import { BaseProps } from "@definitions/props.definition";
import { useMsal } from "@azure/msal-react";
import Loader from "@components/Loader";
import axios from "axios";
import { Account, Role } from "@definitions/types";
import { EventType, EventMessage } from "@azure/msal-browser";
import { MS_GRAPH_SCOPE, SCOPES } from "@definitions/configs/msal/scopes";
import axiosClient from "@definitions/axios";

const userInitialData: Account = {
  displayName: "",
  email: "",
  givenName: "",
  surname: "",
  id: " ",
};

export const AuthContext = createContext<AuthContextState>({
  user: userInitialData,
  hasPermissions: () => false,
  permissions: [],
  loading: true,
});
export const useAuthContext = () => {
  return useContext(AuthContext);
};
export type AuthContextState = {
  loading?: boolean;
  user: Account;
  permissions: string[];
  hasPermissions: (requiredPermissions: string[]) => boolean;
};

export const AuthProvider = ({ children }: BaseProps) => {
  const { instance: msalClient } = useMsal();
  const [user, setUser] = useState<Account>(userInitialData);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  const useAccount = async () => {
    try {
      if (msalClient.getAllAccounts().length === 0) throw "no accounts.";
      const account = msalClient.getAllAccounts()[0];
      msalClient.setActiveAccount(account);
      const tokens = await msalClient.acquireTokenSilent({
        scopes: MS_GRAPH_SCOPE,
      });

      const user = await fetchLoggedInUserData(tokens.accessToken);
      const accountData: Account = {
        id: user.data.id,
        displayName: user.data.displayName,
        email: user.data.mail,
        givenName: user.data.givenName,
        surname: user.data.surname,
      };
      await verifyAccount(accountData);
      await getRolePermissions();
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };
  const fetchLoggedInUserData = async (accessToken: string) => {
    const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setUser({
      email: response.data.mail,
      givenName: response.data.givenName,
      surname: response.data.surname,
      id: response.data.id,
      displayName: response.data.displayName,
    });
    return response;
  };
  const verifyAccount = async (account: Account) => {
    try {
      const tokens = await msalClient.acquireTokenSilent({
        scopes: [
          "api://e8119d61-569d-4c7c-8783-e605e6ddeaef/Library.ClientAppAccess",
        ],
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
        scopes: [
          "api://e8119d61-569d-4c7c-8783-e605e6ddeaef/Library.ClientAppAccess",
        ],
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
      setPermissions(() => permissionsArr);
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

  const subscribeMsalEvent = () => {
    msalClient.enableAccountStorageEvents();
    const callbackId = msalClient.addEventCallback((message: EventMessage) => {
      if (
        message.eventType === EventType.INITIALIZE_START ||
        message.eventType === EventType.LOGIN_SUCCESS
      ) {
        setLoading(true);
        useAccount().finally(() => {
          setLoading(false);
        });
      }
    });
    return callbackId;
  };

  useEffect(() => {
    const id = subscribeMsalEvent();
    return () => {
      msalClient.disableAccountStorageEvents();
      if (!id) return;
      msalClient.removeEventCallback(id);
    };
  }, []);
  return (
    <AuthContext.Provider
      value={{
        hasPermissions,
        permissions,
        user,
        loading,
      }}
    >
      {!loading ? children : <Loader />}
    </AuthContext.Provider>
  );
};
