import { Game, GameLog } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { string } from "yup";

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

export const useDeleteGame = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, string, unknown>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: (id) =>
      Delete(`/games/${id}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useGameLog = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<
  any,
  unknown,
  Omit<GameLog, "id" | "client" | "game" | "createdAt">,
  unknown
>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/games/logs`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useGameLogs = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions<GameLog[]>) => {
  const { Get } = useRequest();

  const fetchLogs = async () => {
    try {
      const { data: response } = await Get("/games/logs", {
        params: {},
      });

      const { data } = response;
      return data?.gameLogs ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<GameLog[]>({
    queryFn: fetchLogs,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["gameLogs"],
    onSettled,
  });
};

export const useDeleteGameLog = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, string, unknown>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: (logId) =>
      Delete(`/games/logs/${logId}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useEditGameLog = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<
  any,
  unknown,
  Omit<GameLog, "client" | "game" | "createdAt">,
  unknown
>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Put(`/games/logs/${form.id}`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
