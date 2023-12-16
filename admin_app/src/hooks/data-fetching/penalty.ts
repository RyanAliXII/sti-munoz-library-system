import { PenaltyClassification } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { MutationOptions, useMutation } from "@tanstack/react-query";

export const useNewPenaltyClass = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<
  any,
  unknown,
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
