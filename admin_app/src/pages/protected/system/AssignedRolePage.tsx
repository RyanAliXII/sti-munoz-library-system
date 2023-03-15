import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { apiScope } from "@definitions/configs/msal/scopes";
import { AccountRole } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";

const AssignedRolePage = () => {
  const { Get, Delete } = useRequest();
  const { isOpen, open, close } = useSwitch();
  const [selectedRow, setSelectedRow] = useState<AccountRole>();
  const fetchAccountWithAssignedRoles = async () => {
    try {
      const { data: response } = await Get("/system/roles/accounts", {}, [
        apiScope("AccessControl.Role.Read"),
      ]);
      console.log(response);
      return response?.data?.accounts ?? [];
    } catch {
      return [];
    }
  };

  const { data: accounts, refetch } = useQuery<AccountRole[]>({
    queryFn: fetchAccountWithAssignedRoles,
    queryKey: ["accounts"],
  });

  const confirmDelete = () => {
    if (selectedRow) {
      deleteRoleAssignment.mutate(selectedRow);
    }
  };

  const deleteRoleAssignment = useMutation({
    mutationFn: (assignment: AccountRole) =>
      Delete(
        `/system/roles/${assignment.role.id}/accounts/${assignment.account.id}`
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
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold">Assigned Roles</h1>
      </ContainerNoBackground>
      <Container>
        <Table>
          <Thead>
            <HeadingRow>
              <Th>User Account</Th>
              <Th>Role</Th>
              <Th></Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {accounts?.map((accountRole) => {
              return (
                <BodyRow key={accountRole.account.id}>
                  <Td>{accountRole.account.displayName}</Td>
                  <Td>{accountRole.role.name}</Td>
                  <Td>
                    <AiOutlineDelete
                      className="text-red-400 text-xl cursor-pointer"
                      onClick={() => {
                        setSelectedRow(accountRole);
                        open();
                      }}
                    ></AiOutlineDelete>
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
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
