import { Penalty } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";

export const usePenalties = () => {
  const { Get } = useRequest();
  const fetchPenalties = async () => {
    try {
      const response = await Get("/penalties/");
      const { data } = response.data;

      return data.penalties ?? [];
    } catch (error) {
      return [];
    }
  };
  return useQuery<Penalty[]>({
    queryFn: fetchPenalties,
    queryKey: ["penalties"],
  });
};
