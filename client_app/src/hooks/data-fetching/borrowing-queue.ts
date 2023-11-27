import { BorrowingQueue } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  QueryFunction,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

interface UseBorrowingQueueProps
  extends UseQueryOptions<UseBorrowingQueueData> {}
type UseBorrowingQueueData = {
  queues: BorrowingQueue[];
};
export const useBorrowingQueue = ({
  onSuccess,
  onError,
  onSettled,
}: UseBorrowingQueueProps) => {
  const { Get } = useRequest();

  const fetchQueues = async () => {
    try {
      const { data: response } = await Get("/borrowing/queues", {});

      return {
        queues: response?.data?.queues ?? [],
      } as UseBorrowingQueueData;
    } catch {
      return {
        queues: [],
      } as UseBorrowingQueueData;
    }
  };
  return useQuery<UseBorrowingQueueData>({
    queryFn: fetchQueues,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["queues"],
    onSettled,
  });
};

export const useActiveQueues = ({
  onSuccess,
  onError,
  onSettled,
}: UseBorrowingQueueProps) => {
  const { Get } = useRequest();

  const fetchQueues = async () => {
    try {
      const { data: response } = await Get("/borrowing/queues", {});

      return {
        queues: response?.data?.queues ?? [],
      } as UseBorrowingQueueData;
    } catch {
      return {
        queues: [],
      } as UseBorrowingQueueData;
    }
  };
  return useQuery<UseBorrowingQueueData>({
    queryFn: fetchQueues,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["queues"],
    onSettled,
  });
};
export const useQueueHistory = ({
  onSuccess,
  onError,
  onSettled,
  queryKey,
}: UseQueryOptions<BorrowingQueue[], unknown, BorrowingQueue[]>) => {
  const { Get } = useRequest();

  const fetchInativeItems: QueryFunction<BorrowingQueue[]> = async ({}) => {
    try {
      const { data: response } = await Get(`/borrowing/queues/history`, {});
      return response?.data?.inactiveItems ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<BorrowingQueue[]>({
    queryFn: fetchInativeItems,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: queryKey,
    onSettled,
  });
};
export const useDequeueItem = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, string, unknown>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: (id) =>
      Delete(`/borrowing/queues/items/${id}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
