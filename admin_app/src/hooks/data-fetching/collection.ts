import { Section } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { MutationOptions, useMutation, useQuery } from "@tanstack/react-query";

export const useMainCollections = () => {
  const { Get } = useRequest();
  const fetchSections = async () => {
    try {
      const { data: response } = await Get("/sections/", {
        params: {
          isMain: true,
        },
      });
      return response.data?.sections ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  return useQuery<Section[]>({
    queryFn: fetchSections,
    queryKey: ["sectionsMain"],
  });
};
export const useDeleteCollection = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, number, unknown>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: (id) =>
      Delete(`/sections/${id}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
