import { Notification } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { MutationOptions, useMutation, useQuery } from "@tanstack/react-query";

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
    refetchOnWindowFocus: false,
    queryKey: ["notifications"],
  });
};
export const useNotificationsRead = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, unknown, unknown>) => {
  const { Patch } = useRequest();
  return useMutation({
    mutationFn: () =>
      Patch(
        `/notifications/read`,
        {},
        {
          headers: {
            "content-type": "application/json",
          },
        }
      ),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
