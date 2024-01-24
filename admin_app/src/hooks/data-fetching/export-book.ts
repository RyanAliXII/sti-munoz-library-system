import { Accession } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

export const useExportBooks = ({
  queryKey,
}: UseQueryOptions<
  Accession[],
  unknown,
  Accession[],
  [string, string, string]
>) => {
  const { Get } = useRequest();
  const exportBooks: QueryFunction<
    Accession[],
    [string, string, string]
  > = async ({ queryKey }) => {
    try {
      const collectionId = queryKey[1];
      const fileType = queryKey[2];
      const { data: response } = await Get("/books/exportation", {
        params: {
          collectionId,
          fileType,
        },
      });
      return response.data?.books ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  return useQuery<Accession[], unknown, Accession[], [string, string, string]>({
    queryFn: exportBooks,
    queryKey: queryKey,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
