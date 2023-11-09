import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";

import { ScannerAccount as ScannerAccountType } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { useState } from "react";
import { AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { toast } from "react-toastify";

import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import TableContainer from "@components/ui/table/TableContainer";
import { Button, Table } from "flowbite-react";
import { BsTrashFill } from "react-icons/bs";
import EditAccountModal from "./EditAccountModal";
import NewAccountModal from "./NewAccountModal";

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
  const {
    data: scannerAccounts,
    isFetching,
    isError,
  } = useQuery<ScannerAccountType[]>({
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
    <>
      <Container>
        <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
          <div className="flex justify-end py-5">
            <Button
              color="primary"
              className="flex items-center gap-2"
              onClick={openAddAccountModal}
            >
              <AiOutlinePlus />
              New Account
            </Button>
          </div>
          <TableContainer>
            <Table>
              <Table.Head>
                <Table.HeadCell>Username</Table.HeadCell>
                <Table.HeadCell>Description</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {scannerAccounts?.map((account) => {
                  return (
                    <Table.Row key={account.id}>
                      <Table.Cell>{account.username}</Table.Cell>
                      <Table.Cell>{account.description}</Table.Cell>
                      <Table.Cell className="flex gap-2">
                        <Tippy content="Edit Account">
                          <Button
                            color="secondary"
                            onClick={() => {
                              setSelectedAccount(account);
                              openEditAccountModal();
                            }}
                            type="button"
                          >
                            <AiOutlineEdit />
                          </Button>
                        </Tippy>
                        <Tippy content="Delete Account">
                          <Button
                            color="failure"
                            onClick={() => {
                              setSelectedAccount(account);
                              openDeleteConfirmation();
                            }}
                            type="button"
                          >
                            <BsTrashFill />
                          </Button>
                        </Tippy>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </TableContainer>
        </LoadingBoundaryV2>
      </Container>
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
    </>
  );
};

export default ScannerAccountPage;
