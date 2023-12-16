import { PenaltyClassification } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useNewPenaltyClass = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<
  any,
  AxiosError<any, any>,
  Omit<PenaltyClassification, "id">,
  unknown
>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post("/penalties/classifications", form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useEditPenaltyClass = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<
  any,
  AxiosError<any, any>,
  PenaltyClassification,
  unknown
>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Put(`/penalties/classifications/${form.id}`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useDeletePenaltyClass = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, AxiosError<any, any>, string, unknown>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: (id) =>
      Delete(`/penalties/classifications/${id}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const usePenaltyClasses = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions<PenaltyClassification[]>) => {
  const { Get } = useRequest();

  const fetchPenaltiesClasses = async () => {
    try {
      const { data: response } = await Get("/penalties/classifications", {
        params: {},
      });

      const { data } = response;
      return data?.penaltyClasses ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<PenaltyClassification[]>({
    queryFn: fetchPenaltiesClasses,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["penaltyClasses"],
    onSettled,
  });
};
