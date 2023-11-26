import { Reservation } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

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

type UpdateStatusForm = {
  id: string;
  statusId: number;
  remarks?: string;
};
export const useUpdateStatus = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, UpdateStatusForm, UpdateStatusForm>) => {
  const { Patch } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Patch(
        `/reservations/${form.id}/status`,
        {
          remarks: form?.remarks ?? "",
        },
        {
          params: {
            statusId: form.statusId,
          },
          headers: {
            "content-type": "application/json",
          },
        }
      ),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
