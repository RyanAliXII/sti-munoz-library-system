import { Game } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useNewGame = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Omit<Game, "id">, unknown>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/games`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useGame = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions<Game[]>) => {
  const { Get } = useRequest();

  const fetchAccounts = async () => {
    try {
      const { data: response } = await Get("/games", {
        params: {},
      });

      const { data } = response;
      return data?.games ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<Game[]>({
    queryFn: fetchAccounts,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["games"],
    onSettled,
  });
};

export const useEditGame = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Game, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Put(`/games/${form.id}`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
