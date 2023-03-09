import { PrimaryButton } from "@components/ui/button/Button";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { Role } from "@definitions/types";

import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";

import {
  AiFillInfoCircle,
  AiOutlineDelete,
  AiOutlineEdit,
} from "react-icons/ai";

import AddRoleModal from "./AddRoleModal";
import { useState } from "react";
import EditRoleModal from "./EditRoleModal";
import { NavLink } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import HasAccess from "@components/auth/HasAccess";

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
      const { data: response } = await Get("/system/roles");
      return response?.data?.roles ?? [];
    } catch {
      return [];
    }
  };
  const { data: roles } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
  const [selectedRole, setSelectedRole] = useState<Role>({
    id: 0,
    name: "",
    permissions: {},
  });

  return (
    <>
      <ContainerNoBackground>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-700">Access Control</h1>
          <HasAccess requiredPermissions={["AccessControl.CreateRole"]}>
            <PrimaryButton onClick={openAddModal}>Create Role</PrimaryButton>
          </HasAccess>
        </div>
      </ContainerNoBackground>

      <ContainerNoBackground className="flex gap-2">
        <div className="w-full py-5 bg-blue-100 rounded">
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
              <HasAccess requiredPermissions={["AccessControl.AssignRole"]}>
                <NavLink
                  to={"/system/access-control/assign"}
                  className="text-xs font-semibold"
                >
                  Start assigning role
                </NavLink>
              </HasAccess>
              <BsArrowRight className="font-semibold" />
            </div>
          </div>
        </div>
      </ContainerNoBackground>
      <Container>
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Roles</Th>
              <Th></Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {roles?.map((role) => {
              return (
                <BodyRow key={role.id}>
                  <Td> {role.name}</Td>
                  <Td className="p-2 flex gap-2 items-center">
                    <HasAccess requiredPermissions={["AccessControl.EditRole"]}>
                      <AiOutlineEdit
                        className="cursor-pointer text-yellow-400 text-xl"
                        onClick={() => {
                          setSelectedRole(role);
                          openEditModal();
                        }}
                      />
                    </HasAccess>
                    <HasAccess
                      requiredPermissions={["AccessControl.DeleteRole"]}
                    >
                      <AiOutlineDelete
                        className="cursor-pointer text-orange-600  text-xl"
                        onClick={() => {
                          setSelectedRole(role);
                        }}
                      />
                    </HasAccess>
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
      </Container>
      <HasAccess requiredPermissions={["AccessControl.CreateRole"]}>
        <AddRoleModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      </HasAccess>
      <HasAccess requiredPermissions={["AccessControl.EditRole"]}>
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
