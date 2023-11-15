import Container from "@components/ui/container/Container";
import useDebounce from "@hooks/useDebounce";
import { CustomInput } from "@components/ui/form/Input";
import { useSwitch } from "@hooks/useToggle";
import { useQueryClient } from "@tanstack/react-query";
import { BaseSyntheticEvent, ChangeEvent, useReducer, useState } from "react";
import { TbFileImport } from "react-icons/tb";
import HasAccess from "@components/auth/HasAccess";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import CustomPagination from "@components/pagination/CustomPagination";
import {
  ConfirmDialog,
  DangerConfirmDialog,
  WarningConfirmDialog,
} from "@components/ui/dialog/Dialog";
import TableContainer from "@components/ui/table/TableContainer";
import {
  useAccount,
  useAccountActivation,
  useAccountDeletion,
  useAccountDisablement,
} from "@hooks/data-fetching/account";
import { Button, Checkbox, Dropdown } from "flowbite-react";
import { toast } from "react-toastify";
import { useSearchParamsState } from "react-use-search-params-state";
import AccountTable from "./AccountTable";
import ImportAccountModal from "./ImportAccountModal";
import { selectedAccountIdsReducer } from "./selected-account-ids-reducer";
import { MdFilterList } from "react-icons/md";

const AccountPage = () => {
  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
    deleted: { type: "boolean", default: false },
    active: { type: "boolean", default: false },
    disabled: { type: "boolean", default: false },
  });
  const {
    close: closeImportModal,
    isOpen: isImportModalOpen,
    open: openImportModal,
  } = useSwitch(false);

  const queryClient = useQueryClient();
  const { isFetching, isError, data } = useAccount({
    filter: filterParams,

    onSuccess: (data) => {
      setTotalPages(data?.pages ?? 1);
    },
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

  const activateAccounts = useAccountActivation({
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
  const deleteAccounts = useAccountDeletion({
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
  const disableAccounts = useAccountDisablement({
    onSuccess: () => {
      toast.success("Account/s have been disabled.");
      dispatchAccountIdSelection({
        payload: {},
        type: "unselect-all",
      });
      queryClient.invalidateQueries(["accounts"]);
    },
    onSettled: () => {
      closeConfirmDisabledDialog();
    },
  });

  const isActivateButtonDisabled = selectedAccountIds.size === 0;
  const isDeleteButtonDisabled = selectedAccountIds.size === 0;
  const isClearSelectionButtonDisabled = selectedAccountIds.size === 0;
  const isDisableButtonDisabled = selectedAccountIds.size === 0;
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
  const {
    isOpen: isConfirmDisableDialogOpen,
    close: closeConfirmDisabledDialog,
    open: openConfirmDisableDialog,
  } = useSwitch();

  const onConfirmDelete = () => {
    deleteAccounts.mutate({ accountIds: Array.from(selectedAccountIds) });
  };
  const onConfirmActivate = () => {
    activateAccounts.mutate({ accountIds: Array.from(selectedAccountIds) });
  };
  const onConfirmDisable = () => {
    disableAccounts.mutate({ accountIds: Array.from(selectedAccountIds) });
  };
  const clearAllSelection = () => {
    dispatchAccountIdSelection({ type: "unselect-all", payload: {} });
  };

  const handleFilterSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const isChecked = event.target.checked;
    setFilterParams({ [name]: isChecked, page: 1 });
  };
  return (
    <>
      <Container>
        <div className="flex items-center justify-between py-4">
          <div className="flex gap-2">
            <Dropdown
              color="light"
              arrowIcon={false}
              className="py-2 p-3"
              label={<MdFilterList className="text-lg" />}
            >
              <div className="p-2 flex gap-2 items-center">
                <Checkbox
                  color="primary"
                  name="active"
                  checked={filterParams?.active}
                  onChange={handleFilterSelection}
                />
                <div className="text-sm">Active</div>
              </div>
              <div className="p-2 flex gap-2 items-center">
                <Checkbox
                  color="primary"
                  name="disabled"
                  checked={filterParams?.disabled}
                  onChange={handleFilterSelection}
                />
                <div className="text-sm">Disabled</div>
              </div>

              <div className="p-2 flex gap-2 items-center">
                <Checkbox
                  color="primary"
                  name="deleted"
                  checked={filterParams?.deleted}
                  onChange={handleFilterSelection}
                />
                <div className="text-sm">Deleted</div>
              </div>
            </Dropdown>
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
                  onClick={openConfirmDeleteDialog}
                >
                  Delete
                </Dropdown.Item>
                <Dropdown.Item
                  disabled={isActivateButtonDisabled}
                  onClick={openConfirmActivateDialog}
                >
                  Activate
                </Dropdown.Item>
                <Dropdown.Item
                  disabled={isDisableButtonDisabled}
                  onClick={openConfirmDisableDialog}
                >
                  Disabled
                </Dropdown.Item>
                <Dropdown.Item onClick={openImportModal}>Import</Dropdown.Item>
              </Dropdown>
            </div>
            <div className="hidden gap-2 md:flex">
              <Button
                color="failure"
                disabled={isDeleteButtonDisabled}
                onClick={openConfirmDeleteDialog}
              >
                Delete
              </Button>
              <Button
                color="success"
                disabled={isActivateButtonDisabled}
                onClick={openConfirmActivateDialog}
              >
                Activate
              </Button>
              <Button
                color="warning"
                disabled={isDisableButtonDisabled}
                onClick={openConfirmDisableDialog}
              >
                Disable
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
              accounts={data?.accounts ?? []}
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
      <WarningConfirmDialog
        close={closeConfirmDisabledDialog}
        isOpen={isConfirmDisableDialogOpen}
        title="Account Disablement"
        text="Are you want to disabled selected accounts?"
        onConfirm={onConfirmDisable}
      />

      <DangerConfirmDialog
        close={closeConfirmDeleteDialog}
        isOpen={isConfirmDeleteDialogOpen}
        title="Account Deletion"
        text="Are you want to delete selected accounts?"
        onConfirm={onConfirmDelete}
      />
      <HasAccess requiredPermissions={["Account.Access"]}>
        <ImportAccountModal
          closeModal={closeImportModal}
          isOpen={isImportModalOpen}
        />
      </HasAccess>
    </>
  );
};

export default AccountPage;
