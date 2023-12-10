import { Notification } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";

export const useNotifications = () => {
  const { Get } = useRequest();
  const fetchNotifications = async () => {
    try {
      const { data: response } = await Get("/notifications", {});
      return response.data?.notifications ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  return useQuery<Notification[]>({
    queryFn: fetchNotifications,
    queryKey: ["notifications"],
  });
};
