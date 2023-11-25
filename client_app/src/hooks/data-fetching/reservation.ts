import { Reservation } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
export type ReserveForm = Omit<
  Reservation,
  | "id"
  | "accountId"
  | "client"
  | "device"
  | "status"
  | "statusId"
  | "createdAt"
  | "timeSlot"
  | "dateSlot"
  | "remarks"
>;
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useNewReservation = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, ReserveForm, unknown>) => {
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

export const useReservations = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions<Reservation[]>) => {
  const { Get } = useRequest();
  const fetchReservations = async () => {
    try {
      const { data: response } = await Get("/reservations", {
        params: {},
      });

      const { data } = response;
      return data?.reservations ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<Reservation[]>({
    queryFn: fetchReservations,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["reservations"],
    onSettled,
  });
};
