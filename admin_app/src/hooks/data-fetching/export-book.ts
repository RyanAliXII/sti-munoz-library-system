import { Accession } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
const ContentType = {
  ".csv": "text/csv",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
export const useExportBooks = ({
  queryKey,
}: UseQueryOptions<string, unknown, string, [string, number, string]>) => {
  const { Get } = useRequest();
  const exportBooks: QueryFunction<string, [string, number, string]> = async ({
    queryKey,
  }) => {
    try {
      const collectionId = queryKey[1];
      const fileType = queryKey[2];
      if (fileType != ".csv" && fileType != ".xlsx") return "";

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
        type: ContentType[fileType],
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
  return useQuery<string, unknown, string, [string, number, string]>({
    queryFn: exportBooks,
    queryKey: queryKey,
    enabled: false,
    refetchOnWindowFocus: false,
  });
};
