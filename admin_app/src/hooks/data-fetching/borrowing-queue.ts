import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import { BorrowingQueue } from "@definitions/types";
interface UseBorrowingQueueProps
  extends UseQueryOptions<UseBorrowingQueueData> {}
type UseBorrowingQueueData = {
  queues: BorrowingQueue[];
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
