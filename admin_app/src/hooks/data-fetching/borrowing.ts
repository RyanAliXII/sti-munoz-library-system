import {
  BookInitialValue,
  BorrowedCopyInitialValue,
} from "@definitions/defaults";
import { BorrowedBook } from "@definitions/types";

import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  QueryFunction,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useBorrowedBookByScanning = ({
  queryKey,
  onSuccess,
  onError,
}: UseQueryOptions<BorrowedBook, unknown, BorrowedBook, [string, string]>) => {
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
  const fetchAccession: QueryFunction<BorrowedBook, [string, string]> = async ({
    queryKey,
  }) => {
    try {
      const accessionId = queryKey[1];
      if (accessionId.length === 0) return DefaultValue;
      const { data: response } = await Get(
        `/borrowing/borrowed-books/accessions/${accessionId}`,
        {}
      );

      return response?.data?.borrowedBook ?? { ...BorrowedCopyInitialValue };
    } catch (error) {
      return { ...BorrowedCopyInitialValue };
    }
  };
  return useQuery<BorrowedBook, unknown, BorrowedBook, [string, string]>({
    queryFn: fetchAccession,
    queryKey: queryKey,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess,
  });
};

export const useReturnBulk = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<
  any,
  unknown,
  { borrowedBookIds: string[]; remarks: string },
  unknown
>) => {
  const { Patch } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Patch(`/borrowing/borrowed-books/return/bulk`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
