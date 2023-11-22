import { useRequest } from "@hooks/useRequest";
import { MutationOptions, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type NewDateSlotBody = {
  from: string;
  to: string;
};
export const useNewDateSlots = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, AxiosError<any, any>, NewDateSlotBody) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/date-slots`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
