import { Device, DeviceLog, Metadata } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  QueryFunction,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useNewDevice = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Omit<Device, "id">, unknown>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/devices`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

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

export const useEditDevice = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Device, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Put(`/devices/${form.id}`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
export const useDeleteDevice = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, string, unknown>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: (bookId) =>
      Delete(`/devices/${bookId}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useDeviceLog = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<
  any,
  unknown,
  Omit<
    DeviceLog,
    "id" | "client" | "device" | "createdAt" | "loggedOutAt" | "isLoggedOut"
  >,
  unknown
>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/devices/logs`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

type DeviceLogFilter = {
  page: number;
  keyword: string;
  from: string;
  to: string;
};
type DeviceLogsData = {
  metadata: Metadata;
  deviceLogs: DeviceLog[];
};
export const useDeviceLogs = ({
  onSuccess,
  onError,
  onSettled,
  queryKey,
}: UseQueryOptions<
  DeviceLogsData,
  unknown,
  DeviceLogsData,
  [string, DeviceLogFilter]
>) => {
  const { Get } = useRequest();

  const fetchLogs: QueryFunction<
    DeviceLogsData,
    [string, DeviceLogFilter]
  > = async ({ queryKey }) => {
    try {
      const filter = queryKey[1];
      const { data: response } = await Get("/devices/logs", {
        params: {
          page: filter?.page ?? 1,
          keyword: filter?.keyword ?? "",
          from: filter?.from ?? "",
          to: filter?.to ?? "",
        },
      });
      const { data } = response;
      return data;
    } catch {
      return {
        deviceLogs: [],
        metadata: {
          pages: 1,
          records: 0,
        },
      };
    }
  };
  return useQuery<
    DeviceLogsData,
    unknown,
    DeviceLogsData,
    [string, DeviceLogFilter]
  >({
    queryFn: fetchLogs,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: queryKey,
    onSettled,
  });
};

export const useDeviceLogout = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, string, unknown>) => {
  const { Patch } = useRequest();
  return useMutation({
    mutationFn: (logId) =>
      Patch(
        `/devices/logs/${logId}/logout`,
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
