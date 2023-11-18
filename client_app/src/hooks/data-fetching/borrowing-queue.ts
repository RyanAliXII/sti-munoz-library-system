import { BorrowingQueue } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

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
