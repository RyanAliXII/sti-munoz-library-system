import { BookInitialValue } from "@definitions/defaults";
import { Book, BookStatus } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

type UseBookViewData = {
  book: Book;
  status: BookStatus;
};

export const useBookView = ({
  onError,
  onSuccess,
}: UseQueryOptions<UseBookViewData>) => {
  const { Get } = useRequest();
  const { id } = useParams();
  const fetchBookById = async () => {
    const { data: response } = await Get(`/books/${id}`, {});
    return (
      response?.data ??
      ({
        book: BookInitialValue,
        status: {
          isAlreadyBorrowed: true,
          isAlreadyInBag: true,
          isAvailable: false,
        },
      } as UseBookViewData)
    );
  };

  return useQuery<UseBookViewData>({
    queryFn: fetchBookById,
    queryKey: ["book"],
    retry: false,
    onError,
    onSuccess,
  });
};
