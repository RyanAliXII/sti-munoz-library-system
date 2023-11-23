import { Device } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export const useDevices = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions<Device[]>) => {
  const { Get } = useRequest();

  const fetchDevices = async () => {
    try {
      const { data: response } = await Get("/devices", {
        params: {},
      });

      const { data } = response;
      return data?.devices ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<Device[]>({
    queryFn: fetchDevices,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["devices"],
    onSettled,
  });
};
