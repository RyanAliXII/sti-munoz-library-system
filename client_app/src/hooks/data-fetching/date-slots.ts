import { DateSlot } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  QueryFunctionContext,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

type DateSlotFilter = {
  start: string;
  end: string;
};
export const useDateSlotsThisMonth = ({
  onSuccess,
  onError,
  onSettled,
  queryKey,
}: UseQueryOptions<unknown, unknown, DateSlot[], [string, DateSlotFilter]>) => {
  const { Get } = useRequest();

  const fetchDateSlots: QueryFunction<
    DateSlot[],
    [string, DateSlotFilter]
  > = async ({ queryKey }) => {
    try {
      const filter = queryKey[1];

      const { data: response } = await Get("/date-slots", {
        params: {
          start: filter.start,
          end: filter.end,
        },
      });
      const { data } = response;
      return (data?.dateSlots ?? []) as DateSlot[];
    } catch (err) {
      return [] as DateSlot[];
    }
  };
  return useQuery<DateSlot[], unknown, DateSlot[], [string, DateSlotFilter]>({
    queryKey: queryKey,
    queryFn: fetchDateSlots,
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
