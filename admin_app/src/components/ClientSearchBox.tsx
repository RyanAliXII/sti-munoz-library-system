import { InputClasses } from "@components/ui/form/Input";

import { Account } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import Downshift from "downshift";
import { BaseSyntheticEvent, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useRequest } from "@hooks/useRequest";
import { Label } from "flowbite-react";

type ClientSearchBoxProps = {
  setClient: (account: Account) => void;
  className?: string;
  value?: string;
};
const HIGHLIGHTED_CLASS = "bg-gray-100 dark:bg-gray-600";
const ClientSearchBox = ({
  setClient,
  className,
  value,
}: ClientSearchBoxProps) => {
  const [searchKeyword, setKeyword] = useState("");
  const debounce = useDebounce();
  const DELAY_IN_MILLISECOND = 500;
  const handleSearchBoxChange = (event: BaseSyntheticEvent) => {
    debounce(() => setKeyword(event.target.value), null, DELAY_IN_MILLISECOND);
  };
  const { Get } = useRequest();
  const fetchAccounts = async () => {
    try {
      const { data: response } = await Get("/accounts/?active=true", {
        params: {
          offset: 0,
          keyword: searchKeyword,
        },
      });
      return response?.data?.accounts ?? [];
    } catch {
      return [];
    }
  };
  const { data: accounts, isRefetching } = useQuery<Account[]>({
    refetchOnMount: false,
    initialData: [],
    queryKey: ["accounts", searchKeyword],
    queryFn: fetchAccounts,
  });

  return (
    <>
      <Downshift
        itemToString={(account) => (account ? account.displayName : "")}
        onChange={(account) => {
          setClient(account);
        }}
      >
        {({
          getInputProps,
          isOpen,
          getItemProps,
          getMenuProps,
          highlightedIndex,
        }) => (
          <div
            className={
              className ? className + " relative" : "w-10/12  relative"
            }
          >
            <Label>Search client</Label>
            <input
              value={value}
              {...getInputProps({
                placeholder: "Enter client's surname, given name or email",
                onChange: handleSearchBoxChange,
                className:
                  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
              })}
            />

            {isOpen && accounts.length > 0 ? (
              !isRefetching ? (
                <ul
                  {...getMenuProps({
                    className:
                      "w-full absolute list-none max-h-80 bg-white overflow-y-auto cursor-pointer border mt-2 rounded z-20 dark:bg-gray-700 dark:border-gray-600 small-scroll",
                  })}
                >
                  {accounts?.map((account, index) => {
                    return (
                      <li
                        {...getItemProps({
                          key: account.id,
                          item: account,
                          className: `p-3 border flex dark:border-gray-600 flex-col ${
                            index === highlightedIndex ? HIGHLIGHTED_CLASS : ""
                          }`,
                        })}
                      >
                        <span className="text-gray-600 dark:text-gray-100">
                          {account.displayName}
                        </span>
                        <small className="text-gray-300">{account.email}</small>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="w-full absolute list-none h-52 overflow-y-auto cursor-pointer items-center flex justify-center bg-white border rounded mt-2 dark:bg-gray-700 z-20">
                  <ClipLoader color="#C5C5C5" />
                </div>
              )
            ) : null}

            {isOpen && accounts.length === 0 ? (
              <div className="w-full absolute list-none h-52 bg-white overflow-y-auto cursor-pointer border mt-2 rounded flex items-center justify-center dark:bg-gray-700 dark:border-none z-20">
                <span className="text-gray-400 text-sm">
                  No result found for {searchKeyword}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </Downshift>
    </>
  );
};

export default ClientSearchBox;
