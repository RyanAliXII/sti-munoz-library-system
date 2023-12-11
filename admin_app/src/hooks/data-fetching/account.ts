import { Account } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

type ActivateAccountData = {
  accountIds: string[];
  programId: number;
  userTypeId: number;
  studentNumber?: string;
};

export const useAccountActivation = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, ActivateAccountData, unknown>) => {
  const { Patch } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Patch("/accounts/activation", form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useAccountDeletion = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, ActivateAccountData, unknown>) => {
  const { Patch } = useRequest();
  return useMutation({
    mutationFn: ({ accountIds }) =>
      Patch(
        "/accounts/deletion",
        {
          accountIds: accountIds,
        },
        {
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

export const useAccountDisablement = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, { accountIds: string[] }, unknown>) => {
  const { Patch } = useRequest();
  return useMutation({
    mutationFn: ({ accountIds }) =>
      Patch(
        "/accounts/deactivation",
        {
          accountIds: accountIds,
        },
        {
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

export const useAccountRestoration = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, ActivateAccountData, unknown>) => {
  const { Patch } = useRequest();
  return useMutation({
    mutationFn: ({ accountIds }) =>
      Patch(
        "/accounts/restoration",
        {
          accountIds: accountIds,
        },
        {
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

interface UseAccountProps extends UseQueryOptions<UseAccountData> {
  filter: any;
}
type UseAccountData = {
  accounts: Account[];
  pages: number;
};
export const useAccount = ({
  filter,
  onSuccess,
  onError,
  onSettled,
}: UseAccountProps) => {
  const { Get } = useRequest();

  const fetchAccounts = async () => {
    try {
      const { data: response } = await Get("/accounts/", {
        params: {
          page: filter?.page,
          keyword: filter?.keyword,
          active: filter?.active,
          deleted: filter?.deleted,
          disabled: filter?.disabled,
        },
      });

      return {
        accounts: response?.data?.accounts ?? [],
        pages: response?.data?.metadata?.pages ?? 1,
      } as UseAccountData;
    } catch {
      return {
        accounts: [],
        pages: 1,
      } as UseAccountData;
    }
  };
  return useQuery<UseAccountData>({
    queryFn: fetchAccounts,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["accounts", filter],
    onSettled,
  });
};
