import { useRequest } from "@hooks/useRequest";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export const useSearchTags = ({
  onSuccess,
  onSettled,
  onError,
}: UseQueryOptions<string[]>) => {
  const { Get } = useRequest();
  const fetchTags = async () => {
    try {
      const { data: response } = await Get("/search-tags", {
        params: {},
      });

      const { data } = response;
      return data?.tags ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<string[]>({
    queryFn: fetchTags,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["userTypes"],
    onSettled,
  });
};
