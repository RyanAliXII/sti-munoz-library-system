import { createContext, useEffect, useState } from "react";
import { BaseProps } from "../definitions/interfaces/Props";
import { useMsal } from "@azure/msal-react";
import { AuthContextState } from "../definitions/interfaces/Contexts";
import Loader from "../components/Loader";
import axios from "axios";
import { User } from "../definitions/configs/authConfig";
import {
  AccountInfo,
  EventType,
  EventMessage,
  AuthenticationResult,
} from "@azure/msal-browser";

export const AuthContext = createContext({} as AuthContextState);
export const AuthProvider = ({ children }: BaseProps) => {
  const { instance: msalClient } = useMsal();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({} as User);
  const [loading, setLoading] = useState(true);

  const useAccountFromStorage = async () => {
    try {
      if (msalClient.getAllAccounts().length > 0) {
        const account = msalClient.getAllAccounts()[0];
        const acquireTokenResp = await msalClient.acquireTokenSilent({
          scopes: ["User.Read"],
        });
        await useAccount(account, acquireTokenResp.accessToken);
      } else {
        throw new Error("NO ACCOUNTS");
      }
    } catch (error) {
      setAuthenticated(false);
    }
  };
  const useAccount = async (account: AccountInfo | null, accessToken = "") => {
    if (account && accessToken.length > 0) {
      msalClient.setActiveAccount(account);
      await fetchUser(accessToken);
      setAuthenticated(true);
      return;
    }
    setAuthenticated(false);
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
  };

  const subscribeMsalEvent = () => {
    msalClient.enableAccountStorageEvents();
    const callbackId = msalClient.addEventCallback((message: EventMessage) => {
      if (message.eventType === EventType.INITIALIZE_END) {
        init();
      }
      if (message.eventType === EventType.LOGIN_SUCCESS) {
        const payload: AuthenticationResult =
          message.payload as AuthenticationResult;
        useAccount(payload.account, payload.accessToken);
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
    <AuthContext.Provider value={{ authenticated, setAuthenticated, user }}>
      {!loading ? children : <Loader />}
    </AuthContext.Provider>
  );
};
