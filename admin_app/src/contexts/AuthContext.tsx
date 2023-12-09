import { EventMessage } from "@azure/msal-browser/dist/event/EventMessage";
import { EventType } from "@azure/msal-browser/dist/event/EventType";
import { useMsal } from "@azure/msal-react";
import Loader from "@components/Loader";
import axiosClient from "@definitions/configs/axios";
import { MS_GRAPH_SCOPE, apiScope } from "@definitions/configs/msal/scopes";
import { BaseProps } from "@definitions/props.definition";
import { Account } from "@definitions/types";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const userInitialData: Account = {
  displayName: "",
  email: "",
  givenName: "",
  programCode: "",
  programName: "",
  userType: "",
  studentNumber: "",
  surname: "",
  id: " ",
  isActive: false,
  isDeleted: false,
  metadata: {
    approvedBooks: 0,
    cancelledBooks: 0,
    checkedOutBooks: 0,
    pendingBooks: 0,
    returnedBooks: 0,
    totalPenalty: 0,
  },
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
  const [loading, setLoading] = useState(true);
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
      const accountData: Omit<
        Account,
        "metadata" | "isActive" | "isDeleted",
        "programCode" | "programName" | "studentNumber"
      > = {
        id: user.data.id,
        displayName: user.data.displayName,
        email: user.data.mail,
        givenName: user.data.givenName,
        surname: user.data.surname,
      };
      await verifyAccount(accountData);
      await getPermissions();

      return true;
    } catch (error) {
      console.error(error);
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

    return response;
  };
  const verifyAccount = async (
    account: Omit<Account, "metadata" | "isActive" | "isDeleted">
  ) => {
    const tokens = await msalClient.acquireTokenSilent({
      scopes: [apiScope("LibraryServer.Access")],
    });
    const response = await axiosClient.post(
      "/system/accounts/verification",
      account,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const { data } = response.data;
    setUser(data.account);
  };

  const getPermissions = async () => {
    const tokens = await msalClient.acquireTokenSilent({
      scopes: [apiScope("LibraryServer.Access")],
    });

    const { data: response } = await axiosClient.post(
      "/system/accounts/permissions",
      {},
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );

    if (!response?.data?.permissions) return;
    setPermissions(response?.data?.permissions ?? "");
  };

  const hasPermissions = (requiredPermissions: string[]) => {
    // if empty array is given, it means accessing module doesnt not require any permissions for access.
    if (requiredPermissions.length === 0) {
      return true;
    }
    let requiredCount = 0;
    for (const p of requiredPermissions) {
      if (permissions.includes(p)) {
        requiredCount++;
      }
    }
    //this means that all permissions has been met
    return requiredCount === requiredPermissions.length;
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
