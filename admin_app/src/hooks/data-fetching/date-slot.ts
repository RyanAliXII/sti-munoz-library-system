import { DateSlot } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

type NewDateSlotBody = {
  from: string;
  to: string;
};
export const useNewDateSlots = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, AxiosError<any, any>, NewDateSlotBody>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/date-slots`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useDeleteDateSlots = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, AxiosError<any, any>, string>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: (slotId) =>
      Delete(`/date-slots/${slotId}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useDateSlots = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions<DateSlot[]>) => {
  const { Get } = useRequest();

  const fetchSlots = async () => {
    try {
      const { data: response } = await Get("/date-slots", {
        params: {},
      });
      const { data } = response;
      return data?.slots ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<DateSlot[]>({
    queryFn: fetchSlots,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["dateSlots"],
    onSettled,
  });
};
