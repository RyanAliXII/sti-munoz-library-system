import Container from "@components/ui/container/Container";

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
import {
  ConfirmDialog,
  DangerConfirmDialog,
} from "@components/ui/dialog/Dialog";
import TableContainer from "@components/ui/table/TableContainer";
import { Button, Dropdown, Modal } from "flowbite-react";
import { toast } from "react-toastify";
import { useSearchParamsState } from "react-use-search-params-state";
import AccountTable from "./AccountTable";
import UploadArea from "./UploadArea";
import { selectedAccountIdsReducer } from "./selected-account-ids-reducer";

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
    new Set<string>([])
  );
  const { Patch } = useRequest();

  const markAsActive = useMutation({
    mutationFn: () =>
      Patch(
        "/accounts/activation",
        {
          accountIds: Array.from(selectedAccountIds),
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
        payload: {},
        type: "unselect-all",
      });
      queryClient.invalidateQueries(["accounts"]);
    },
    onSettled: () => {
      closeConfirmActivateDialog();
    },
  });

  const deleteAccount = useMutation({
    mutationFn: () =>
      Patch(
        "/accounts/deletion",
        {
          accountIds: Array.from(selectedAccountIds),
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
        payload: {},
        type: "unselect-all",
      });
      queryClient.invalidateQueries(["accounts"]);
    },
    onSettled: () => {
      closeConfirmDeleteDialog();
    },
  });

  const isActivateButtonDisabled = selectedAccountIds.size === 0;
  const isDeleteButtonDisabled = selectedAccountIds.size === 0;
  const isClearSelectionButtonDisabled = selectedAccountIds.size === 0;
  const {
    isOpen: isConfirmActivateDialogOpen,
    close: closeConfirmActivateDialog,
    open: openConfirmActivateDialog,
  } = useSwitch();
  const {
    isOpen: isConfirmDeleteDialogOpen,
    close: closeConfirmDeleteDialog,
    open: openConfirmDeleteDialog,
  } = useSwitch();
  const initActivation = () => {
    openConfirmActivateDialog();
  };
  const initDeletion = () => {
    openConfirmDeleteDialog();
  };
  const onConfirmDelete = () => {
    deleteAccount.mutate();
  };
  const onConfirmActivate = () => {
    markAsActive.mutate();
  };
  const clearAllSelection = () => {
    dispatchAccountIdSelection({ type: "unselect-all", payload: {} });
  };
  return (
    <>
      <Container>
        <div className="flex items-center justify-between py-4">
          <div className="flex gap-2">
            <CustomInput
              type="text"
              placeholder="Search accounts"
              onChange={handleSearch}
              defaultValue={filterParams?.keyword}
            />
            <Button
              outline
              color="light"
              disabled={isClearSelectionButtonDisabled}
              onClick={clearAllSelection}
            >
              Clear all selection
            </Button>
          </div>
          <HasAccess requiredPermissions={["Account.Access"]}>
            <div className="md:hidden">
              <Dropdown color="primary" label="Actions">
                <Dropdown.Item
                  disabled={isDeleteButtonDisabled}
                  onClick={initDeletion}
                >
                  Delete
                </Dropdown.Item>
                <Dropdown.Item
                  disabled={isActivateButtonDisabled}
                  onClick={initActivation}
                >
                  Activate
                </Dropdown.Item>
                <Dropdown.Item onClick={openImportModal}>Import</Dropdown.Item>
              </Dropdown>
            </div>
            <div className="hidden gap-2 md:flex">
              <Button
                color="failure"
                disabled={isDeleteButtonDisabled}
                onClick={initDeletion}
              >
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
      <ConfirmDialog
        close={closeConfirmActivateDialog}
        isOpen={isConfirmActivateDialogOpen}
        title="Account Activation"
        text="Are you want to activate selected accounts?"
        onConfirm={onConfirmActivate}
      />
      <DangerConfirmDialog
        close={closeConfirmDeleteDialog}
        isOpen={isConfirmDeleteDialogOpen}
        title="Account Deletion"
        text="Are you want to delete selected accounts?"
        onConfirm={onConfirmDelete}
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
