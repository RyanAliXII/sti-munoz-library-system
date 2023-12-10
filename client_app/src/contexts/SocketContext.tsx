import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, createContext } from "react";
import useWebSocket from "react-use-websocket";
import { useAuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import NotificationSound from "@assets/sound/notification-sound.mp3";
import { useNotifications } from "@hooks/data-fetching/notification";
const SocketContext = createContext({});

type SocketProviderProps = {
  children?: ReactNode;
};
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { user } = useAuthContext();
  const WS_URL = import.meta.env.VITE_WS_URL;
  const url = new URL(WS_URL);
  url.searchParams.set("account", user.id ?? "");
  const queryClient = useQueryClient();
  const {} = useWebSocket(url.toString(), {
    onMessage: () => {
      toast.success("Notification created.");
      new Audio(NotificationSound)?.play();
      queryClient.invalidateQueries(["notifications"]);
    },
  });
  return <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;
};
