import { BookInitialValue } from "@definitions/defaults";
import {
  Accession,
  CheckoutAccession,
  DetailedAccession,
} from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  QueryFunction,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

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

export const useEditAccession = ({
  onSuccess,
  onError,
  onSettled,
}: MutationOptions<any, AxiosError<any, any>, Accession, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (accession) =>
      Put(`/books/accessions/${accession?.id}`, accession),
    onSuccess,
    onError,
    onSettled,
  });
};

type UseAccessionByCollectionData = {
  accessions: DetailedAccession[];
};
export const useAccessionsByCollection = ({
  onError,
  onSettled,
  onSuccess,
  refetchOnWindowFocus,
  queryKey,
}: UseQueryOptions<
  UseAccessionByCollectionData,
  unknown,
  UseAccessionByCollectionData,
  [string, number]
>) => {
  const { Get } = useRequest();
  const fetchAccessions: QueryFunction<
    UseAccessionByCollectionData,
    [string, number]
  > = async ({ queryKey }) => {
    try {
      const collectionId = queryKey[1];
      if (collectionId == 0) {
        return {
          accessions: [],
        };
      }
      const { data: response } = await Get(
        `/books/accessions/collections/${collectionId}`,
        {}
      );

      return {
        accessions: response?.data.accessions ?? [],
      };
    } catch {
      return {
        accessions: [],
      };
    }
  };
  return useQuery<
    UseAccessionByCollectionData,
    unknown,
    UseAccessionByCollectionData,
    [string, number]
  >({
    onSuccess,
    queryFn: fetchAccessions,
    onError,
    queryKey,
    onSettled,
    refetchOnWindowFocus,
  });
};
