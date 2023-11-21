import { TimeSlot } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { MutationOptions, useMutation } from "@tanstack/react-query";

export const useNewTimeSlot = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Omit<TimeSlot, "id">, unknown>) => {
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
