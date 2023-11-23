import { Device, Reservation } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

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
