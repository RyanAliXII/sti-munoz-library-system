import HasAccess from "@components/auth/HasAccess";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import CustomPagination from "@components/pagination/CustomPagination";
import Container from "@components/ui/container/Container";
import {
  ConfirmDialog,
  DangerConfirmDialog,
  WarningConfirmDialog,
} from "@components/ui/dialog/Dialog";
import { CustomInput } from "@components/ui/form/Input";
import TableContainer from "@components/ui/table/TableContainer";
import { Account } from "@definitions/types";
import {
  useAccount,
  useAccountActivation,
  useAccountDisablement,
} from "@hooks/data-fetching/account";
import useDebounce from "@hooks/useDebounce";
import { useSwitch } from "@hooks/useToggle";
import { useQueryClient } from "@tanstack/react-query";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import { Button, Checkbox, Dropdown } from "flowbite-react";
import { BaseSyntheticEvent, ChangeEvent, useReducer, useState } from "react";
import { MdFilterList } from "react-icons/md";
import { TbFileImport } from "react-icons/tb";
import { toast } from "react-toastify";
import { useSearchParamsState } from "react-use-search-params-state";
import AccountTable from "./AccountTable";
import ActivateModal from "./ActivateModal";
import ImportAccountModal from "./ImportAccountModal";
import { selectedAccountIdsReducer } from "./selected-account-ids-reducer";

const AccountPage = () => {
  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
    deleted: { type: "boolean", default: false },
    active: { type: "boolean", default: true },
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
    new Map<string, Account>()
  );

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

  const {
    isOpen: isConfirmRestoreDialogOpen,
    close: closeConfirmRestoreDialog,
    open: openConfirmRestoreDialog,
  } = useSwitch();

  const activateModal = useSwitch();
  const onConfirmDelete = () => {
    // deleteAccounts.mutate({ accountIds: Array.from(selectedAccountIds) });
  };
  const onConfirmActivate = () => {
    // activateAccounts.mutate({ accountIds: Array.from(selectedAccountIds) });
  };
  const onConfirmDisable = () => {
    const ids = Array.from(selectedAccountIds.keys()).map((k) => k);
    disableAccounts.mutate({
      accountIds: ids,
    });
  };
  const onConfirmRestore = () => {
    // restoreAccounts.mutate({ accountIds: Array.from(selectedAccountIds) });
  };
  const clearAllSelection = () => {
    dispatchAccountIdSelection({ type: "unselect-all", payload: {} });
  };

  const handleFilterSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const isChecked = event.target.checked;
    setFilterParams({ [name]: isChecked, page: 1 });
  };

  const singleActivateModal = useSwitch();
  const singleDisableModal = useSwitch();
  const [singleAccount, setSingleAccount] = useState<Map<string, Account>>(
    new Map<string, Account>()
  );
  const initActivate = () => {
    activateModal.open();
  };
  const initActivateSingle = (account: Account) => {
    const m = new Map();
    m.set(account.id, account);
    setSingleAccount(m);
    singleActivateModal.open();
  };
  const initDeactivateSingle = (account: Account) => {
    const m = new Map();
    m.set(account.id, account);
    setSingleAccount(m);
    singleDisableModal.open();
  };
  const onConfirmSingleDisabled = () => {
    singleDisableModal.close();
    const ids = Array.from(singleAccount.keys()).map((k) => k);
    disableAccounts.mutate({
      accountIds: ids,
    });
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

          <div className="flex gap-2">
            <HasAccess requiredPermissions={["Account.Edit"]}>
              <Dropdown
                color="secondary"
                label="Actions"
                disabled={
                  isActivateButtonDisabled &&
                  isDeleteButtonDisabled &&
                  isDisableButtonDisabled
                }
              >
                <Dropdown.Item
                  disabled={isActivateButtonDisabled}
                  onClick={initActivate}
                >
                  Activate
                </Dropdown.Item>
                <Dropdown.Item
                  disabled={isDisableButtonDisabled}
                  onClick={openConfirmDisableDialog}
                >
                  Disabled
                </Dropdown.Item>
              </Dropdown>
            </HasAccess>
            <HasAccess requiredPermissions={["Account.Add"]}>
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
        </div>
        <TableContainer>
          <LoadingBoundaryV2
            isLoading={isFetching}
            isError={isError}
            contentLoadDelay={50}
          >
            <AccountTable
              selectedAccountIds={selectedAccountIds}
              initActivate={initActivateSingle}
              initDeactivate={initDeactivateSingle}
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
        key="activate"
        close={closeConfirmActivateDialog}
        isOpen={isConfirmActivateDialogOpen}
        title="Account Activation"
        text="Are you want to activate selected accounts?"
        onConfirm={onConfirmActivate}
      />
      <ConfirmDialog
        key="restore"
        close={closeConfirmRestoreDialog}
        isOpen={isConfirmRestoreDialogOpen}
        title="Account Restoration"
        text="Are you sure want to restore account?"
        onConfirm={onConfirmRestore}
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

      <ImportAccountModal
        closeModal={closeImportModal}
        isOpen={isImportModalOpen}
      />
      <ActivateModal
        dispatchSelection={dispatchAccountIdSelection}
        selectedAccounts={selectedAccountIds}
        closeModal={activateModal.close}
        isOpen={activateModal.isOpen}
      />
      <ActivateModal
        key={"single"}
        dispatchSelection={dispatchAccountIdSelection}
        selectedAccounts={singleAccount}
        closeModal={singleActivateModal.close}
        isOpen={singleActivateModal.isOpen}
      />
      <WarningConfirmDialog
        key={"singleDisable"}
        close={singleDisableModal.close}
        isOpen={singleDisableModal.isOpen}
        title="Account Disablement"
        text="Are you want to disabled selected accounts?"
        onConfirm={onConfirmSingleDisabled}
      />
    </>
  );
};

export default AccountPage;
