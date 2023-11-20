import {
  MutationOptions,
  QueryFunction,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import { BorrowingQueue, BorrowingQueueItem } from "@definitions/types";

type UseBorrowingQueueData = {
  queues: BorrowingQueue[];
};

export const useActiveQueues = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions) => {
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

type QueueDeletionData = {
  bookId: string;
};

export const useDequeueActive = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, QueueDeletionData, unknown>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: ({ bookId }) =>
      Delete(`/borrowing/queues/${bookId}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

type QueueItemsData = {
  items: BorrowingQueueItem[];
};
export const useQueueItems = ({
  onSuccess,
  onError,
  onSettled,
  queryKey,
}: UseQueryOptions<QueueItemsData, unknown, QueueItemsData>) => {
  const { Get } = useRequest();

  const fetchQueueItems: QueryFunction<QueueItemsData> = async ({
    queryKey,
  }) => {
    try {
      const bookId = queryKey?.[1] ?? "";
      const { data: response } = await Get(`/borrowing/queues/${bookId}`, {});
      return {
        items: response?.data?.items ?? [],
      } as QueueItemsData;
    } catch {
      return {
        items: [],
      } as QueueItemsData;
    }
  };
  return useQuery<QueueItemsData>({
    queryFn: fetchQueueItems,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: queryKey,
    onSettled,
  });
};

type QueueItemUpdateData = {
  bookId: string;
  items: BorrowingQueueItem[];
};
export const useQueueItemsUpdate = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, QueueItemUpdateData, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: ({ items, bookId }) =>
      Put(
        `/borrowing/queues/${bookId}`,
        {
          items: items.map((item) => ({
            id: item.id,
            bookId: item.bookId,
          })),
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

type QueueItemDeletionData = {
  id: string;
};
export const useDequeueItem = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, QueueItemDeletionData, unknown>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: ({ id }) =>
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
