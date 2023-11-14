import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

import { Account } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";

import { CustomInput } from "@components/ui/form/Input";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BaseSyntheticEvent, useReducer, useState } from "react";
import { TbFileImport } from "react-icons/tb";

import HasAccess from "@components/auth/HasAccess";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";

import { useRequest } from "@hooks/useRequest";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

import CustomPagination from "@components/pagination/CustomPagination";
import TableContainer from "@components/ui/table/TableContainer";
import { Button, Modal } from "flowbite-react";
import { useSearchParamsState } from "react-use-search-params-state";
import UploadArea from "./UploadArea";
import AccountTable from "./AccountTable";
import { selectedAccountIdsReducer } from "./reducer";

const AccountPage = () => {
  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
  });
  const {
    close: closeImportModal,
    isOpen: isImportModalOpen,
    open: openImportModal,
  } = useSwitch(false);
  const { Get } = useRequest();

  const fetchAccounts = async () => {
    try {
      const { data: response } = await Get("/accounts/", {
        params: {
          page: filterParams?.page,
          keyword: filterParams?.keyword,
        },
      });
      setTotalPages(response?.data?.metadata?.pages ?? 0);
      return response?.data?.accounts ?? [];
    } catch {
      return [];
    }
  };
  const queryClient = useQueryClient();
  const {
    data: accounts,
    isFetching,
    isError,
  } = useQuery<Account[]>({
    queryFn: fetchAccounts,
    queryKey: ["accounts", filterParams],
  });
  const debounceSearch = useDebounce();
  const search = (q: any) => {
    setFilterParams({ page: 1, keyword: q });
  };
  const handleSearch = (event: BaseSyntheticEvent) => {
    debounceSearch(search, event.target.value, 500);
  };
  const { Patch } = useRequest();
  const markAsActive = useMutation({
    mutationFn: ({ accountIds }: { accountIds: string[] }) =>
      Patch(
        "/accounts/activations",
        {
          accountIds: accountIds,
        },
        {
          headers: {
            "content-type": "application/json",
          },
        }
      ),
  });
  const [selectedAccountIds, dispatch] = useReducer(
    selectedAccountIdsReducer,
    []
  );
  return (
    <>
      <Container>
        <div className="flex items-center justify-between py-4">
          <CustomInput
            type="text"
            placeholder="Search accounts"
            onChange={handleSearch}
            defaultValue={filterParams?.keyword}
          ></CustomInput>
          <HasAccess requiredPermissions={["Account.Access"]}>
            <Button
              color="primary"
              onClick={() => {
                openImportModal();
              }}
            >
              <TbFileImport className="text-lg" />
              Import
            </Button>
          </HasAccess>
        </div>
        <TableContainer>
          <LoadingBoundaryV2
            isLoading={isFetching}
            isError={isError}
            contentLoadDelay={150}
          >
            <AccountTable
              selectedAccountIds={selectedAccountIds}
              dispatchSelection={dispatch}
              accounts={accounts ?? []}
            />
            <div className="py-3">
              <CustomPagination
                nextLabel="Next"
                pageRangeDisplayed={5}
                pageCount={totalPages}
                onPageChange={({ selected }) => {
                  setFilterParams({ page: selected + 1 });
                }}
                isHidden={totalPages <= 1}
                previousLabel="Previous"
                forcePage={filterParams?.page - 1}
                renderOnZeroPageCount={null}
              />
            </div>
          </LoadingBoundaryV2>
        </TableContainer>
      </Container>
      <ContainerNoBackground></ContainerNoBackground>

      <HasAccess requiredPermissions={["Account.Access"]}>
        <Modal show={isImportModalOpen} onClose={closeImportModal} dismissible>
          <Modal.Header>Import Account</Modal.Header>
          <Modal.Body>
            <UploadArea
              refetch={() => {
                queryClient.invalidateQueries(["accounts"]);
              }}
            ></UploadArea>
          </Modal.Body>
        </Modal>
      </HasAccess>
    </>
  );
};

export default AccountPage;
