import LoadingBoundary from "@components/loader/LoadingBoundary";
import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";

import { AccountRole } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Table } from "flowbite-react";

import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";

const AssignedRolePage = () => {
  const { Get, Delete } = useRequest();
  const { isOpen, open, close } = useSwitch();
  const [selectedRow, setSelectedRow] = useState<AccountRole>();
  const fetchAccountWithAssignedRoles = async () => {
    try {
      const { data: response } = await Get("/system/roles/accounts", {});
      return response?.data?.accounts ?? [];
    } catch {
      return [];
    }
  };

  const {
    data: accounts,
    refetch,
    isFetching,
    isError,
  } = useQuery<AccountRole[]>({
    queryFn: fetchAccountWithAssignedRoles,
    queryKey: ["assignedAccounts"],
  });

  const confirmDelete = () => {
    if (selectedRow) {
      deleteRoleAssignment.mutate(selectedRow);
    }
  };

  const deleteRoleAssignment = useMutation({
    mutationFn: (assignment: AccountRole) =>
      Delete(
        `/system/roles/${assignment.role.id}/accounts/${assignment.account.id}`,
        {}
      ),
    onSuccess(data, variables, context) {
      toast.success("Role assignment has been removed.");
    },
    onError() {
      toast.error(ErrorMsg.Delete);
    },
    onSettled() {
      refetch();
      close();
    },
  });
  return (
    <>
      <Container>
        <LoadingBoundary isError={isError} isLoading={isFetching}>
          <Table>
            <Table.Head>
              <Table.HeadCell>User Account</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {accounts?.map((accountRole) => {
                return (
                  <Table.Row key={accountRole.account.id}>
                    <Table.Cell>{accountRole.account.displayName}</Table.Cell>
                    <Table.Cell>{accountRole.role.name}</Table.Cell>
                    <Table.Cell>
                      <Button
                        color="failure"
                        onClick={() => {
                          setSelectedRow(accountRole);
                          open();
                        }}
                      >
                        <AiOutlineDelete />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </LoadingBoundary>
      </Container>
      <DangerConfirmDialog
        close={close}
        onConfirm={confirmDelete}
        isOpen={isOpen}
        title="Remove Role Assignment"
        text="Are you sure you want to remove role assignment to this user?"
      ></DangerConfirmDialog>
    </>
  );
};

export default AssignedRolePage;
