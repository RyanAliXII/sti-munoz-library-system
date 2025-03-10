import { Book, Metadata } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  QueryFunction,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

type MigrateForm = { sectionId: number; bookIds: string[] };
export const useMigrateCollection = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, MigrateForm, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Put("/books/collections/migrations", form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

type BookFilter = {
  page: number;
  keyword: string;
  tags: string[];
  collections: number[];
  mainC: string[];
  fromYearPublished: number;
  toYearPublished: number;
  includeSubCollection: boolean;
};
type UseBookData = {
  books: Book[];
  metadata: Metadata;
};
export const useBooks = ({
  queryKey,
  onSuccess,
}: UseQueryOptions<
  UseBookData,
  unknown,
  UseBookData,
  [string, BookFilter]
>) => {
  const { Get } = useRequest();
  const fetchBooks: QueryFunction<UseBookData, [string, BookFilter]> = async ({
    queryKey,
  }) => {
    const filter = queryKey[1];
    try {
      const { data: response } = await Get("/books/", {
        params: filter,
      });

      return {
        books: response?.data?.books ?? [],
        metadata: {
          pages: response?.data?.metadata?.pages ?? 0,
          records: response?.data?.metadata?.records ?? 0,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        books: [],
        metadata: {
          pages: 0,
          records: 0,
        },
      };
    }
  };
  return useQuery<UseBookData, unknown, UseBookData, [string, BookFilter]>({
    queryFn: fetchBooks,
    queryKey: queryKey,
    onSuccess,
  });
};
