import { Accession } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

export const useExportBooks = ({
  queryKey,
}: UseQueryOptions<string, unknown, string, [string, string, string]>) => {
  const { Get } = useRequest();
  const exportBooks: QueryFunction<string, [string, string, string]> = async ({
    queryKey,
  }) => {
    try {
      const collectionId = queryKey[1];
      const fileType = queryKey[2];
      const { data } = await Get("/books/exportation", {
        params: {
          collectionId,
          fileType,
        },
        responseType: "arraybuffer",
      });
      const bufferLength = data.byteLength ?? 0;
      if (bufferLength === 0) return "";
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error(error);
      return "";
    }
  };
  return useQuery<string, unknown, string, [string, string, string]>({
    queryFn: exportBooks,
    queryKey: queryKey,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
