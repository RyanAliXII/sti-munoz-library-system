import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { ButtonClasses, PrimaryButton } from "@components/ui/button/Button";
import {
  Table,
  HeadingRow,
  Tbody,
  Th,
  Thead,
  BodyRow,
  Td,
} from "@components/ui/table/Table";
import { ScannerAccount as ScannerAccountType } from "@definitions/types";
import { useSwitch } from "@hooks/useToggle";
import { AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import { toast } from "react-toastify";
import Tippy from "@tippyjs/react";

import { BsTrashFill } from "react-icons/bs";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import NewAccountModal from "./NewAccountModal";
import EditAccountModal from "./EditAccountModal";

const ScannerAccountPage = () => {
  const { Get, Delete } = useRequest();
  const [selectedAccount, setSelectedAccount] = useState<ScannerAccountType>({
    description: "",
    username: "",
    id: "",
    password: "",
  });
  const fetchAccounts = async () => {
    try {
      const { data: response } = await Get("/scanner-accounts/");
      return response?.data?.scannerAccounts ?? [];
    } catch (error) {
      return [];
    }
  };
  const { data: scannerAccounts } = useQuery<ScannerAccountType[]>({
    queryFn: fetchAccounts,
    queryKey: ["scannerAccounts"],
  });
  const queryClient = useQueryClient();
  const deleteAccount = useMutation({
    mutationFn: () => Delete(`/scanner-accounts/${selectedAccount.id}`),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      queryClient.invalidateQueries(["scannerAccounts"]);
    },
    onError: () => {
      toast.error("Unknown error occurred.");
    },
  });
  const {
    close: closeAddAccountModal,
    isOpen: isAddAccountModalOpen,
    open: openAddAccountModal,
  } = useSwitch();
  const {
    close: closeEditAccountModal,
    isOpen: isEditAccountModalOpen,
    open: openEditAccountModal,
  } = useSwitch();
  const {
    close: closeDeleteConfirmation,
    isOpen: isDeleteConfirmationOpen,
    open: openDeleteConfirmation,
  } = useSwitch();
  return (
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10">
      <div className="w-full flex justify-between mb-5">
        <h1 className="text-2xl">Scanner Account</h1>
        <PrimaryButton
          className="flex items-center gap-2"
          onClick={openAddAccountModal}
        >
          <AiOutlinePlus />
          New Account
        </PrimaryButton>
      </div>

      <div>
        <LoadingBoundaryV2 isError={false} isLoading={false}>
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Username</Th>
                <Th>Description</Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {scannerAccounts?.map((account) => {
                return (
                  <BodyRow key={account.id}>
                    <Td>{account.username}</Td>
                    <Td>{account.description}</Td>
                    <Td className="flex gap-2">
                      <Tippy content="Edit Account">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            openEditAccountModal();
                          }}
                          type="button"
                          className={
                            ButtonClasses.PrimaryOutlineButtonClasslist
                          }
                        >
                          <AiOutlineEdit />
                        </button>
                      </Tippy>
                      <Tippy content="Delete Account">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            openDeleteConfirmation();
                          }}
                          type="button"
                          className={ButtonClasses.DangerButtonOutlineClasslist}
                        >
                          <BsTrashFill />
                        </button>
                      </Tippy>
                    </Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </LoadingBoundaryV2>
      </div>
      <NewAccountModal
        key={"add"}
        closeModal={closeAddAccountModal}
        isOpen={isAddAccountModalOpen}
      />
      <EditAccountModal
        key={"edit"}
        account={selectedAccount}
        closeModal={closeEditAccountModal}
        isOpen={isEditAccountModalOpen}
      />
      <DangerConfirmDialog
        close={closeDeleteConfirmation}
        isOpen={isDeleteConfirmationOpen}
        title="Delete Scanner Account!"
        text="Are you sure you want to delete this account?"
        onConfirm={() => {
          closeDeleteConfirmation();
          deleteAccount.mutate();
        }}
      />
    </div>
  );
};

export default ScannerAccountPage;
