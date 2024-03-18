import { PenaltyClassification } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  QueryFunction,
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

export const usePenaltyBill = ({
  queryKey,
}: UseQueryOptions<string, unknown, string, [string, string]>) => {
  const { Get } = useRequest();
  const exportBorrowedBooks: QueryFunction<string, [string, string]> = async ({
    queryKey,
  }) => {
    try {
      const id = queryKey[1];
      const { data } = await Get(`/penalties/${id}/bill`, {
        responseType: "arraybuffer",
      });
      const bufferLength = data.byteLength ?? 0;
      if (bufferLength === 0) return "";
      const blob = new Blob([data], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      return url;
    } catch (error) {
      console.error(error);
      return "";
    }
  };
  return useQuery<string, unknown, string, [string, string]>({
    queryFn: exportBorrowedBooks,
    queryKey: queryKey,
    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useExportPenalties = ({
  queryKey,
}: UseQueryOptions<string, unknown, string, [string, string, any]>) => {
  const { Get } = useRequest();
  const exportPenalties: QueryFunction<string, [string, string, any]> = async ({
    queryKey,
  }) => {
    try {
      const fileType = queryKey[1];
      const filters = queryKey[2];

      if (fileType != ".csv" && fileType != ".xlsx") return "";

      const { data } = await Get("/penalties/export", {
        params: {
          ...filters,
          fileType,
        },
        responseType: "arraybuffer",
      });
      const bufferLength = data.byteLength ?? 0;
      if (bufferLength === 0) return "";
      const blob = new Blob([data], {
        type: "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = Date.now();
      a.download = `${filename}${fileType}`;
      a.click();
      return url;
    } catch (error) {
      console.error(error);
      return "";
    }
  };
  return useQuery<string, unknown, string, [string, string, any]>({
    queryFn: exportPenalties,
    queryKey: queryKey,
    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
