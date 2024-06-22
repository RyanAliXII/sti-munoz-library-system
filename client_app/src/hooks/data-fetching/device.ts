import { Device } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

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

const DeviceInitalValue = {
  description: "",
  id: "",
  name: "",
};
export const useDevice = ({
  onSuccess,
  onError,
  onSettled,
  queryKey,
}: UseQueryOptions<Device, unknown, Device, [string, string]>) => {
  const { Get } = useRequest();
  const fetchDevice: QueryFunction<Device, [string, string]> = async ({
    queryKey,
  }) => {
    try {
      const deviceId = queryKey[1];
      if (deviceId.length === 0)
        return {
          description: "",
          id: "",
          name: "",
        };
      const { data: response } = await Get(`/devices/${deviceId}`, {
        params: {},
      });

      const { data } = response;
      return data?.device ?? DeviceInitalValue;
    } catch {
      return DeviceInitalValue;
    }
  };
  return useQuery<Device, unknown, Device, [string, string]>({
    queryFn: fetchDevice,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: queryKey,
    onSettled,
  });
};
