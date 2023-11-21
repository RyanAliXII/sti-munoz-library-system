import { Device } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { MutationOptions, useMutation } from "@tanstack/react-query";

export const useNewDevice = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Omit<Device, "id">, unknown>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/devices`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
