import Container from "@components/ui/container/Container";

import { Role } from "@definitions/types";

import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import {
  AiFillInfoCircle,
  AiOutlineDelete,
  AiOutlineEdit,
} from "react-icons/ai";
import HasAccess from "@components/auth/HasAccess";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import TableContainer from "@components/ui/table/TableContainer";
import { Button, Table } from "flowbite-react";
import { useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import { NavLink } from "react-router-dom";
import AddRoleModal from "./AddRoleModal";
import EditRoleModal from "./EditRoleModal";

const AccessControlPage = () => {
  const {
    isOpen: isAddModalOpen,
    close: closeAddModal,
    open: openAddModal,
  } = useSwitch();

  const {
    isOpen: isEditModalOpen,
    close: closeEditModal,
    open: openEditModal,
  } = useSwitch();
  const { Get } = useRequest();
  const fetchRoles = async () => {
    try {
      const { data: response } = await Get("/system/roles", {});
      return response?.data?.roles ?? [];
    } catch {
      return [];
    }
  };
  const {
    data: roles,
    isError,
    isFetching,
  } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
  const [selectedRole, setSelectedRole] = useState<Role>({
    id: 0,
    name: "",
    permissions: [],
  });

  return (
    <>
      <Container>
        <div className="flex justify-end py-4">
          <HasAccess requiredPermissions={["Role.Add"]}>
            <Button color="primary" onClick={openAddModal}>
              Create Role
            </Button>
          </HasAccess>
        </div>
        <div className="w-full py-5 mb-2 bg-blue-100 rounded">
          <div className="flex justify-between gap-5 w-full">
            <div className="flex items-center gap-2">
              <AiFillInfoCircle className="text-xl text-blue-500 ml-2"></AiFillInfoCircle>
              <small className="text-blue-500">
                The user role determines which set of permissions apply to the
                system user. You can assign role to user to allow access to
                certain system modules.
              </small>
            </div>
            <div className="flex items-center gap-2 mr-5 text-blue-500 justify-self-end">
              <HasAccess requiredPermissions={["Role.Assign"]}>
                <NavLink
                  to={"/system/access-control/assign"}
                  className="text-xs font-semibold"
                >
                  Start assigning role
                </NavLink>
                <BsArrowRight className="font-semibold" />
              </HasAccess>
            </div>
          </div>
        </div>

        <LoadingBoundary isError={isError} isLoading={isFetching}>
          <TableContainer>
            <Table>
              <Table.Head>
                <Table.HeadCell>Roles</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {roles?.map((role) => {
                  return (
                    <Table.Row key={role.id}>
                      <Table.Cell> {role.name}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <HasAccess requiredPermissions={["Role.Edit"]}>
                            <Button
                              color="secondary"
                              onClick={() => {
                                setSelectedRole(role);
                                openEditModal();
                              }}
                            >
                              <AiOutlineEdit className="cursor-pointertext-xl" />
                            </Button>
                          </HasAccess>
                          <HasAccess requiredPermissions={["Role.Delete"]}>
                            <Button
                              color="failure"
                              onClick={() => {
                                setSelectedRole(role);
                              }}
                            >
                              <AiOutlineDelete className="cursor-pointer text-xl" />
                            </Button>
                          </HasAccess>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </TableContainer>
        </LoadingBoundary>
      </Container>

      <HasAccess requiredPermissions={["Role.Add"]}>
        <AddRoleModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      </HasAccess>
      <HasAccess requiredPermissions={["Role.Edit"]}>
        <EditRoleModal
          closeModal={closeEditModal}
          isOpen={isEditModalOpen}
          formData={selectedRole}
        />
      </HasAccess>
    </>
  );
};

export default AccessControlPage;
