import { TimeSlot } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { MutationOptions, useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export const useNewTimeSlot = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, AxiosError<any, any>, Omit<TimeSlot, "id">>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/time-slots/profiles/${form.profileId}/slots`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useEditTimeSlot = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, AxiosError<any, any>, TimeSlot>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Put(`/time-slots/profiles/${form.profileId}/slots/${form.id}`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useDeleteTimeSlot = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, AxiosError<any, any>, TimeSlot>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Delete(`/time-slots/profiles/${form.profileId}/slots/${form.id}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
