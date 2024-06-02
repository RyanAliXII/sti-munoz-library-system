import { Penalty } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

export const usePenalties = () => {
  const { Get } = useRequest();
  const fetchPenalties = async () => {
    try {
      const response = await Get("/penalties/");
      const { data } = response.data;

      return data.penalties ?? [];
    } catch (error) {
      return [];
    }
  };
  return useQuery<Penalty[]>({
    queryFn: fetchPenalties,
    queryKey: ["penalties"],
  });
};

export const usePenaltyBill = ({
  queryKey,
}: UseQueryOptions<string, unknown, string, [string, string]>) => {
  const { Get } = useRequest();
  const exportBorrowedBooks: QueryFunction<string, [string, string]> = async ({
    queryKey,
  }) => {
    try {
      const id = queryKey[1];
      const { data } = await Get(`/penalties/${id}/bill`, {
        responseType: "arraybuffer",
      });
      const bufferLength = data.byteLength ?? 0;
      if (bufferLength === 0) return "";
      const blob = new Blob([data], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error(error);
      return "";
    }
  };
  return useQuery<string, unknown, string, [string, string]>({
    queryFn: exportBorrowedBooks,
    queryKey: queryKey,
    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
