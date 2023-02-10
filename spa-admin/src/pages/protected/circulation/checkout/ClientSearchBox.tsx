import { InputClasses } from "@components/forms/Forms";
import axiosClient from "@definitions/configs/axios";
import { Account } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import Downshift from "downshift";
import { BaseSyntheticEvent, useState } from "react";
import { ClipLoader } from "react-spinners";

type ClientSearchBoxProps = {
  setClient: (account: Account) => void;
};
const ClientSearchBox = ({ setClient }: ClientSearchBoxProps) => {
  const [searchKeyword, setKeyword] = useState("");
  const debounce = useDebounce();
  const DELAY_IN_MILLISECOND = 500;
  const handleSearchBoxChange = (event: BaseSyntheticEvent) => {
    debounce(() => setKeyword(event.target.value), null, DELAY_IN_MILLISECOND);
  };
  const fetchAccounts = async () => {
    try {
      const { data: response } = await axiosClient.get("/clients/accounts", {
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
      <Downshift>
        {({ getInputProps, isOpen, closeMenu }) => (
          <div className="w-10/12  relative">
            <label className={InputClasses.LabelClasslist}>Search client</label>
            <input
              {...getInputProps({
                placeholder: "Enter client's surname, given name or email",
                onChange: handleSearchBoxChange,
                className: InputClasses.InputDefaultClasslist,
              })}
            />

            {isOpen && accounts.length > 0 ? (
              !isRefetching ? (
                <ul className="w-full absolute list-none max-h-80 bg-white overflow-y-auto cursor-pointer border mt-2 rounded z-10">
                  {accounts?.map((account) => {
                    return (
                      <li
                        key={account.id}
                        className="p-3 border flex flex-col"
                        onClick={() => {
                          closeMenu(() => {
                            setClient(account);
                          });
                        }}
                      >
                        <span className="text-gray-600">
                          {account.displayName}
                        </span>
                        <small className="text-gray-400">{account.email}</small>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="w-full absolute list-none h-52 overflow-y-auto cursor-pointer items-center flex justify-center bg-white border rounded mt-2">
                  <ClipLoader color="#C5C5C5" />
                </div>
              )
            ) : null}

            {isOpen && accounts.length === 0 ? (
              <div className="w-full absolute list-none h-52 bg-white overflow-y-auto cursor-pointer border mt-2 rounded flex items-center justify-center">
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
