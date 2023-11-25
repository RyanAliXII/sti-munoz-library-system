import { TimeSlot } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

export const useTimeSlotsBasedOnDateAndDevice = ({
  onSuccess,
  onError,
  onSettled,
  queryKey,
}: UseQueryOptions<
  unknown,
  unknown,
  TimeSlot[],
  [string, string, string, string]
>) => {
  const { Get } = useRequest();

  const fetchTimeSlots: QueryFunction<
    TimeSlot[],
    [string, string, string, string]
  > = async ({ queryKey }) => {
    try {
      const profileId = queryKey[1];
      const dateSlotId = queryKey[2];
      const deviceId = queryKey[3];

      if (
        profileId.length === 0 ||
        dateSlotId.length === 0 ||
        deviceId.length === 0
      )
        return [];

      const { data: response } = await Get(
        `/time-slots/profiles/${profileId}/date-slots/${dateSlotId}/devices/${deviceId}`,
        {}
      );
      const { data } = response;
      return (data?.timeSlots ?? []) as TimeSlot[];
    } catch (err) {
      return [] as TimeSlot[];
    }
  };
  return useQuery<
    TimeSlot[],
    unknown,
    TimeSlot[],
    [string, string, string, string]
  >({
    retry: false,
    refetchOnMount: false,
    queryKey: queryKey,
    queryFn: fetchTimeSlots,
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
