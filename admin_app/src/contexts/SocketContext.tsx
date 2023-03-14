import { ReactNode, useEffect, createContext } from "react";
import { useAuthContext } from "./AuthContext";
import { toast } from "react-toastify";

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
      console.debug("socket connected.");
    };
    socket.onmessage = (message) => {
      toast.info(message.data);
    };

    // return () => {
    //   if (socket.OPEN) {
    //     socket.close();
    //   }
    // };
  }, []);
  return <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;
};
