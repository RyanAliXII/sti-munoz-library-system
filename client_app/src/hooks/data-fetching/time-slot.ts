import { Reservation, TimeSlot } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

type UseTimeSlotsBasedOnDateAndDeviceData = {
  timeSlots: TimeSlot[];
  reservations: Reservation[];
};
export const useTimeSlotsBasedOnDateAndDevice = ({
  onSuccess,
  onError,
  onSettled,
  queryKey,
}: UseQueryOptions<
  UseTimeSlotsBasedOnDateAndDeviceData,
  unknown,
  UseTimeSlotsBasedOnDateAndDeviceData,
  [string, string, string, string]
>) => {
  const { Get } = useRequest();

  const fetchTimeSlots: QueryFunction<
    UseTimeSlotsBasedOnDateAndDeviceData,
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
      return (
        data ??
        ({
          reservations: [],
          timeSlots: [],
        } as UseTimeSlotsBasedOnDateAndDeviceData)
      );
    } catch (err) {
      return {
        reservations: [],
        timeSlots: [],
      };
    }
  };
  return useQuery<
    UseTimeSlotsBasedOnDateAndDeviceData,
    unknown,
    UseTimeSlotsBasedOnDateAndDeviceData,
    [string, string, string, string]
  >({
    refetchOnMount: false,
    queryKey: queryKey,
    queryFn: fetchTimeSlots,
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
