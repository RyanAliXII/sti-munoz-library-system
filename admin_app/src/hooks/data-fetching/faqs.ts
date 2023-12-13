import { ExtrasContent } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useFAQs = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions<ExtrasContent>) => {
  const { Get } = useRequest();

  const fetchFAQs = async () => {
    try {
      const { data: response } = await Get("/faqs", {
        params: {},
      });

      const { data } = response;
      return data?.content ?? { value: "", id: 0 };
    } catch {
      return { value: "", id: 0 };
    }
  };
  return useQuery<ExtrasContent>({
    queryFn: fetchFAQs,
    onSuccess: onSuccess,
    onError: onError,
    refetchOnWindowFocus: false,
    queryKey: ["faqs"],
    onSettled,
  });
};

export const useEditFAQs = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, string, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (value: string) =>
      Put(
        `/faqs`,
        {
          value,
        },
        {
          headers: {
            "content-type": "application/json",
          },
        }
      ),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
