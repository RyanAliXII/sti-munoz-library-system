import { UserProgramOrStrand, UserType } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

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

export const useUserTypesWithPrograms = ({
  onSuccess,
  onSettled,
  onError,
}: UseQueryOptions<UserType[]>) => {
  const { Get } = useRequest();

  const fetchUserTypes = async () => {
    try {
      const { data: response } = await Get("/users/types", {
        params: {
          hasProgram: true,
        },
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
    queryKey: ["userTypesWithPrograms"],
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
export const useUserProgramsByType = ({
  onSuccess,
  onSettled,
  onError,
  queryKey,
}: UseQueryOptions<
  UserProgramOrStrand[],
  unknown,
  UserProgramOrStrand[],
  [string, number, boolean]
>) => {
  const { Get } = useRequest();

  const fetchUserPrograms: QueryFunction<
    UserProgramOrStrand[],
    [string, number, boolean]
  > = async ({ queryKey }) => {
    try {
      const typeId = queryKey[1];
      const hasProgram = queryKey[2];
      if (!hasProgram) return [];
      const { data: response } = await Get(`/users/types/${typeId}/programs`, {
        params: {},
      });

      const { data } = response;
      return data?.programs ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<
    UserProgramOrStrand[],
    unknown,
    UserProgramOrStrand[],
    [string, number, boolean]
  >({
    queryFn: fetchUserPrograms,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: queryKey,
    onSettled,
  });
};

export const useNewUserType = ({
  onError,
  onSuccess,
  onSettled,
}: UseMutationOptions<unknown, unknown, Omit<UserType, "id">>) => {
  const { Post } = useRequest();

  return useMutation({
    mutationFn: (form) => Post("/users/types", form, {}),
    onError: onError,
    onSuccess: onSuccess,
    onSettled: onSettled,
  });
};
export const useEditUserType = ({
  onError,
  onSuccess,
  onSettled,
}: UseMutationOptions<unknown, unknown, UserType>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) => Put(`/users/types/${form.id}`, form),
    onError: onError,
    onSuccess: onSuccess,
    onSettled: onSettled,
  });
};

export const useNewProgram = ({
  onError,
  onSuccess,
  onSettled,
}: UseMutationOptions<
  unknown,
  unknown,
  Omit<UserProgramOrStrand, "id" | "userType">
>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) => Post("/users/programs", form, {}),
    onError: onError,
    onSuccess: onSuccess,
    onSettled: onSettled,
  });
};

export const useEditProgram = ({
  onError,
  onSuccess,
  onSettled,
}: UseMutationOptions<unknown, unknown, UserProgramOrStrand>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) => Put(`/users/programs/${form.id}`, form),
    onError: onError,
    onSuccess: onSuccess,
    onSettled: onSettled,
  });
};
