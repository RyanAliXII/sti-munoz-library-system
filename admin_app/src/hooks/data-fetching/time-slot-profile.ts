import { TimeSlotProfile } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { MutationOptions, useMutation } from "@tanstack/react-query";

export const useNewTimeSlotProfile = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Omit<TimeSlotProfile, "id">, unknown>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/time-slot/profile`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
