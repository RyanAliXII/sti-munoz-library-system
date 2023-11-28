import { TimeSlotProfile } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

export const useTimeSlotProfile = ({
  onSuccess,
  onError,
  onSettled,
  queryKey,
}: UseQueryOptions<
  TimeSlotProfile,
  unknown,
  TimeSlotProfile,
  [string, TimeSlotProfile]
>) => {
  const { Get } = useRequest();

  const fetchTimeSlotProfile: QueryFunction<
    TimeSlotProfile,
    [string, TimeSlotProfile]
  > = async ({ queryKey }) => {
    try {
      const profile = queryKey[1];

      if (profile.id.length === 0)
        return {
          id: "",
          name: "",
          timeSlots: [],
        };
      const { data: response } = await Get(
        `/time-slots/profiles/${profile.id}`,
        {
          params: {},
        }
      );
      const { data } = response;
      return (
        data?.profile ??
        ({
          id: "",
          name: "",
        } as TimeSlotProfile)
      );
    } catch (err) {
      throw err;
    }
  };
  return useQuery<
    TimeSlotProfile,
    unknown,
    TimeSlotProfile,
    [string, TimeSlotProfile]
  >({
    queryFn: fetchTimeSlotProfile,
    onSuccess: onSuccess,
    onError: onError,
    retry: false,
    queryKey: queryKey,
  });
};
