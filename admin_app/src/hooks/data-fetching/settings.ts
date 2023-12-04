import { Settings } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useEditSettings = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Settings, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Put(`/system/settings`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useSettings = ({
  onSuccess,
}: UseQueryOptions<Settings, unknown, Settings>) => {
  const { Get } = useRequest();
  const fetchAppSettings = async () => {
    try {
      const response = await Get("/system/settings", {}, []);
      const { data } = response.data;
      return data?.settings ?? {};
    } catch (error) {
      return {};
    }
  };
  return useQuery<Settings, unknown, Settings>({
    queryFn: fetchAppSettings,
    onSuccess: onSuccess,
    queryKey: ["appSettings"],
  });
};
