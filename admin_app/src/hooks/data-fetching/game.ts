import { Game, GameLog, Metadata } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  QueryFunction,
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

  const fetchGames = async () => {
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
    queryFn: fetchGames,
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

type GameLogFilter = {
  page: number;
  keyword: string;
  from: string;
  to: string;
};

type GameLogsData = {
  metadata: Metadata;
  gameLogs: GameLog[];
};
export const useGameLogs = ({
  onSuccess,
  onError,
  onSettled,
  queryKey,
}: UseQueryOptions<
  GameLogsData,
  unknown,
  GameLogsData,
  [string, GameLogFilter]
>) => {
  const { Get } = useRequest();

  const fetchLogs: QueryFunction<
    GameLogsData,
    [string, GameLogFilter]
  > = async ({ queryKey }) => {
    try {
      const filter = queryKey[1];
      const { data: response } = await Get("/games/logs", {
        params: {
          page: filter?.page ?? 1,
          keyword: filter?.keyword ?? "",
          from: filter?.from ?? "",
          to: filter?.to ?? "",
        },
      });
      const { data } = response;
      return data;
    } catch {
      return {
        gameLogs: [],
        metadata: {
          pages: 1,
          records: 0,
        },
      };
    }
  };
  return useQuery<GameLogsData, unknown, GameLogsData, [string, GameLogFilter]>(
    {
      queryFn: fetchLogs,
      onSuccess: onSuccess,
      onError: onError,
      queryKey: queryKey,
      onSettled,
    }
  );
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
