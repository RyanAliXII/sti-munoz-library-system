import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

export const useExportClientLogs = ({
  queryKey,
}: UseQueryOptions<string, unknown, string, [string, string, any]>) => {
  const { Get } = useRequest();
  const exportLogs: QueryFunction<string, [string, string, any]> = async ({
    queryKey,
  }) => {
    try {
      const fileType = queryKey[1];
      const filters = queryKey[2];

      if (fileType != ".csv" && fileType != ".xlsx") return "";

      const { data } = await Get("/client-logs/export", {
        params: {
          ...filters,
          fileType,
        },
        responseType: "arraybuffer",
      });
      const bufferLength = data.byteLength ?? 0;
      if (bufferLength === 0) return "";
      const blob = new Blob([data], {
        type: "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = Date.now();
      a.download = `${filename}${fileType}`;
      a.click();
      return url;
    } catch (error) {
      console.error(error);
      return "";
    }
  };
  return useQuery<string, unknown, string, [string, string, any]>({
    queryFn: exportLogs,
    queryKey: queryKey,
    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
