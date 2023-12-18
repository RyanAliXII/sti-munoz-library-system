import { ExtrasContent } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const usePolicy = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions<ExtrasContent>) => {
  const { Get } = useRequest();

  const fetchPolicy = async () => {
    try {
      const { data: response } = await Get("/policy", {
        params: {},
      });

      const { data } = response;
      return data?.content ?? { value: "", id: 0 };
    } catch {
      return { value: "", id: 0 };
    }
  };
  return useQuery<ExtrasContent>({
    queryFn: fetchPolicy,
    onSuccess: onSuccess,
    onError: onError,
    refetchOnWindowFocus: false,
    queryKey: ["policy"],
    onSettled,
  });
};

export const useEditPolicy = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, string, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (value: string) =>
      Put(
        `/policy`,
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
