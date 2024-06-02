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

export const useExportBorrowedBooks = ({
  queryKey,
}: UseQueryOptions<string, unknown, string, [string, string, any]>) => {
  const { Get } = useRequest();
  const exportBorrowedBooks: QueryFunction<
    string,
    [string, string, any]
  > = async ({ queryKey }) => {
    try {
      const fileType = queryKey[1];
      const filters = queryKey[2];

      if (fileType != ".csv" && fileType != ".xlsx") return "";

      const { data } = await Get("/borrowing/requests/export", {
        params: {
          ...filters,
          fileType,
        },
        responseType: "arraybuffer",
      });
      const bufferLength = data.byteLength ?? 0;
      if (bufferLength === 0) return "";
      const blob = new Blob([data]);
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
    queryFn: exportBorrowedBooks,
    queryKey: queryKey,
    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
