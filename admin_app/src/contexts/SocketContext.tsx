import { useMsal } from "@azure/msal-react";
import { ReactNode, createContext } from "react";
import useWebSocket from "react-use-websocket";
import { useAuthContext } from "./AuthContext";
import { toast } from "react-toastify";

const SocketContext = createContext({});

type SocketProviderProps = {
  children?: ReactNode;
};
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { user } = useAuthContext();
  const { instance } = useMsal();
  const URL = import.meta.env.VITE_WS_URL;

  const {} = useWebSocket(URL, {
    onMessage: () => {
      toast.info("MESSAGE");
    },
  });
  return <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;
};
