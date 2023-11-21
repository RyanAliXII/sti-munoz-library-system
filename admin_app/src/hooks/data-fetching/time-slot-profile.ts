import { TimeSlotProfile } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useNewTimeSlotProfile = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Omit<TimeSlotProfile, "id">, unknown>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/time-slots/profiles`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useEditTimeSlotProfile = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, TimeSlotProfile, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Put(`/time-slots/profiles/${form.id}`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useDeleteTimeSlotProfile = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, string, unknown>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: (profileId) =>
      Delete(`/time-slots/profiles/${profileId}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
export const useTimeSlotProfiles = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions<TimeSlotProfile[]>) => {
  const { Get } = useRequest();

  const fetchGames = async () => {
    try {
      const { data: response } = await Get("/time-slots/profiles", {
        params: {},
      });
      const { data } = response;
      return data?.profiles ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<TimeSlotProfile[]>({
    queryFn: fetchGames,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["profiles"],
    onSettled,
  });
};
