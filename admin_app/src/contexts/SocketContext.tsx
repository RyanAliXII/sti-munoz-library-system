import { ReactNode, createContext, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuthContext } from "./AuthContext";

const SocketContext = createContext({});

type SocketProviderProps = {
  children?: ReactNode;
};
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { user } = useAuthContext();
  useEffect(() => {
    document.title = "Admin";

    const url = new URL("ws://localhost:5200/rt/ws");
    url.searchParams.append("accountId", user.id ?? "");
    const socket = new WebSocket(url);
    socket.onopen = () => {
      console.log("socket connected.");
    };
    socket.onmessage = (message) => {
      toast.info(message.data);
    };

    return () => {
      socket.close();
    };
  }, []);
  return <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;
};
