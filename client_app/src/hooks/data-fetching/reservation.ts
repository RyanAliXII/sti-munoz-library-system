import { Reservation } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { MutationOptions, useMutation } from "@tanstack/react-query";

export const useNewReservation = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<
  any,
  unknown,
  Omit<Reservation, "id" | "accountId">,
  unknown
>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/reservations`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
