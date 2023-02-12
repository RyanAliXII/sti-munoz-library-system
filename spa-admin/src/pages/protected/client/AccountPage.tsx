import ProfileIcon from "@components/ProfileIcon";
import CustomDatePicker from "@components/forms/CustomDatePicker";
import CustomSelect from "@components/forms/CustomSelect";
import { ButtonClasses, Input, PrimaryButton } from "@components/forms/Forms";
import {
  Table,
  BodyRow,
  HeadingRow,
  Td,
  Th,
  Tbody,
  Thead,
} from "@components/table/Table";
import Container from "@components/ui/Container/Container";
import axiosClient from "@definitions/configs/axios";
import { Account } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";
import useScrollWatcher from "@hooks/useScrollWatcher";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { BaseSyntheticEvent, useState } from "react";

const AccountPage = () => {
  const [searchKeyword, setSearchKeyWord] = useState<string>("");
  const fetchAccounts = async ({ pageParam = 0 }) => {
    try {
      const { data: response } = await axiosClient.get("/clients/accounts", {
        params: {
          offset: pageParam,
          keyword: searchKeyword,
        },
      });
      return response?.data?.accounts ?? [];
    } catch {
      return [];
    }
  };
  const queryClient = useQueryClient();
  const { data, fetchNextPage, refetch } = useInfiniteQuery<Account[]>({
    queryFn: fetchAccounts,
    queryKey: ["accounts"],
    refetchOnWindowFocus: false,
    getNextPageParam: (_, allPages) => {
      return allPages.length * 30;
    },
  });
  useScrollWatcher({
    element: window,
    onScrollEnd: () => {
      fetchNextPage();
    },
  });
  const debounceSearch = useDebounce();
  const search = () => {
    queryClient.setQueryData(["accounts"], () => {
      return {
        pageParams: [],
        pages: [],
      };
    });
    refetch();
  };
  const handleSearch = (event: BaseSyntheticEvent) => {
    setSearchKeyWord(event.target.value);
    debounceSearch(search, "", 500);
  };

  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5 flex items-center gap-5">
        <h1 className="text-3xl font-bold text-gray-700">Accounts</h1>
        <div className="w-8/12 ">
          <Input
            type="text"
            placeholder="Search account by email or name"
            onChange={handleSearch}
          ></Input>
        </div>
      </div>

      <Container>
        <Table>
          <Thead>
            <HeadingRow>
              <Td></Td>
              <Th>Email</Th>
              <Th>Client</Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {data?.pages.map((pageData) =>
              pageData.map((account) => {
                return (
                  <BodyRow key={account.id}>
                    <Td>
                      <div className="h-10">
                        <ProfileIcon
                          surname={account.surname}
                          givenName={account.givenName}
                        />
                      </div>
                    </Td>
                    <Td>{account.email}</Td>
                    <Td>{account.displayName}</Td>
                  </BodyRow>
                );
              })
            )}
          </Tbody>
        </Table>
      </Container>
    </>
  );
};

export default AccountPage;
