import { useRequest } from "@hooks/useRequest";
import { MutationOptions, useMutation } from "@tanstack/react-query";

type MigrateForm = { sectionId: number; bookIds: string[] };
export const useMigrateCollection = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, MigrateForm, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Put("/books/collections/migrations", form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
