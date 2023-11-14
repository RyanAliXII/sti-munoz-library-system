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
import AccountTable from "./AccountTable";
import UploadArea from "./UploadArea";
import {
  AccountIdsSelectionAction,
  selectedAccountIdsReducer,
} from "./selected-account-ids-reducer";
import { ConfirmDialog } from "@components/ui/dialog/Dialog";
import { toast } from "react-toastify";

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
  const [selectedAccountIds, dispatchAccountIdSelection] = useReducer(
    selectedAccountIdsReducer,
    []
  );
  const { Patch } = useRequest();

  const markAsActive = useMutation({
    mutationFn: () =>
      Patch(
        "/accounts/activation",
        {
          accountIds: selectedAccountIds,
        },
        {
          headers: {
            "content-type": "application/json",
          },
        }
      ),
    onSuccess: () => {
      toast.success("Account/s have been activated.");
      dispatchAccountIdSelection({
        payload: "",
        type: AccountIdsSelectionAction.UnselectAll,
      });
    },
    onSettled: () => {
      closeConfirmActivateDialog();
    },
  });

  const deleteAccount = useMutation({
    mutationFn: () =>
      Patch(
        "/accounts/deleteion",
        {
          accountIds: selectedAccountIds,
        },
        {
          headers: {
            "content-type": "application/json",
          },
        }
      ),
    onSuccess: () => {
      toast.success("Account/s have been deleted.");
      dispatchAccountIdSelection({
        payload: "",
        type: AccountIdsSelectionAction.UnselectAll,
      });
    },
    onSettled: () => {},
  });

  const isActivateButtonDisabled = selectedAccountIds.length === 0;
  const isDeleteButtonDisabled = selectedAccountIds.length === 0;
  const {
    isOpen: isConfirmActivateDialogOpen,
    close: closeConfirmActivateDialog,
    open: openConfirmActivateDialog,
  } = useSwitch();
  const initActivation = () => {
    openConfirmActivateDialog();
  };
  const onConfirmActivate = () => {
    markAsActive.mutate();
  };
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
            <div className="flex gap-2">
              <Button color="failure" disabled={isDeleteButtonDisabled}>
                Delete
              </Button>
              <Button
                color="success"
                disabled={isActivateButtonDisabled}
                onClick={initActivation}
              >
                Activate
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  openImportModal();
                }}
              >
                <TbFileImport className="text-lg" />
                Import
              </Button>
            </div>
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
              dispatchSelection={dispatchAccountIdSelection}
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
      <ConfirmDialog
        close={closeConfirmActivateDialog}
        isOpen={isConfirmActivateDialogOpen}
        title="Account Activation"
        text="Are you want to activate selected accounts ?"
        onConfirm={onConfirmActivate}
      />
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
