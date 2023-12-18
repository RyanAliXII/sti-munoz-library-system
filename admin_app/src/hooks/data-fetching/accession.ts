import { BookInitialValue } from "@definitions/defaults";
import { CheckoutAccession } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

export const useAccessionByScanning = ({
  queryKey,
  onSuccess,
  onError,
}: UseQueryOptions<
  CheckoutAccession,
  unknown,
  CheckoutAccession,
  [string, string]
>) => {
  const DefaultValue = {
    copyNumber: 0,
    isAvailable: false,
    isMissing: false,
    isWeeded: false,
    number: 0,
    remarks: "",
    id: "",
    book: BookInitialValue,
    bookId: "",
    isCheckedOut: false,
  };
  const { Get } = useRequest();
  const fetchAccession: QueryFunction<
    CheckoutAccession,
    [string, string]
  > = async ({ queryKey }) => {
    try {
      const accessionId = queryKey[1];
      if (accessionId.length === 0) return DefaultValue;
      const { data: response } = await Get(
        `/books/accessions/${accessionId}`,
        {}
      );

      return response?.data?.accession ?? { ...DefaultValue };
    } catch (error) {
      return { ...DefaultValue };
    }
  };
  return useQuery<
    CheckoutAccession,
    unknown,
    CheckoutAccession,
    [string, string]
  >({
    queryFn: fetchAccession,
    queryKey: queryKey,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess,
  });
};
