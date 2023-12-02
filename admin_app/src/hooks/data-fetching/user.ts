import { UserType } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export const useUserTypes = ({
  onSuccess,
  onSettled,
  onError,
}: UseQueryOptions<UserType[]>) => {
  const { Get } = useRequest();

  const fetchUserTypes = async () => {
    try {
      const { data: response } = await Get("/users/types", {
        params: {},
      });

      const { data } = response;
      return data?.userTypes ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<UserType[]>({
    queryFn: fetchUserTypes,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["userTypes"],
    onSettled,
  });
};
