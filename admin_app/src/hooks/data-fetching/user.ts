import { UserProgramOrStrand, UserType } from "@definitions/types";
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

export const useUserPrograms = ({
  onSuccess,
  onSettled,
  onError,
}: UseQueryOptions<UserProgramOrStrand[]>) => {
  const { Get } = useRequest();

  const fetchUserPrograms = async () => {
    try {
      const { data: response } = await Get("/users/programs", {
        params: {},
      });

      const { data } = response;
      return data?.programs ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<UserProgramOrStrand[]>({
    queryFn: fetchUserPrograms,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["userPrograms"],
    onSettled,
  });
};
