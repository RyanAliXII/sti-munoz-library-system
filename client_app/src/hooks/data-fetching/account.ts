import { AccountStats } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";

export const useAccountStats = () => {
  const { Get } = useRequest();
  const fetchNotifications = async () => {
    try {
      const { data: response } = await Get("/accounts/stats", {});
      return (
        response.data?.stats ?? {
          maxAllowedBorrowedBooks: 0,
          isAllowedToBorrow: false,
          totalBorrowedBooks: 0,
          maxUniqueDeviceReservationPerDay: 0,
        }
      );
    } catch (error) {
      return {
        maxAllowedBorrowedBooks: 0,
        isAllowedToBorrow: false,
        totalBorrowedBooks: 0,
        maxUniqueDeviceReservationPerDay: 0,
      };
    }
  };
  return useQuery<AccountStats>({
    queryFn: fetchNotifications,
    queryKey: ["accountStats"],
  });
};
