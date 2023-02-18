import { ReactNode, useEffect, createContext } from "react";
import { useAuthContext } from "./AuthContext";

const SocketContext = createContext({});

type SocketProviderProps = {
  children?: ReactNode;
};
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { user, authenticated } = useAuthContext();
  useEffect(() => {
    document.title = "Admin";
    if (!authenticated) return;

    const url = new URL("ws://localhost:5200/rt/ws");
    url.searchParams.append("accountId", user.id);
    let socket = new WebSocket(url);
    socket.onopen = () => {
      console.log("Successfully Connected");
    };
    socket.onmessage = (message) => {
      console.log(message);
    };
    socket.onclose = (event) => {
      console.log("Socket Closed Connection: ", event);
      socket.send("Client Closed!");
    };

    socket.onerror = (error) => {
      console.log("Socket Error: ", error);
    };
  }, [authenticated]);
  return <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;
};
