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

import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

import AddRoleModal from "./AddRoleModal";
import { useState } from "react";
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
          <PrimaryButton onClick={openAddModal}>Create Role</PrimaryButton>
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
                    <AiOutlineEdit
                      className="cursor-pointer text-yellow-400 text-xl"
                      onClick={() => {
                        setSelectedRole(role);
                        openEditModal();
                      }}
                    />
                    <AiOutlineDelete
                      className="cursor-pointer text-orange-600  text-xl"
                      onClick={() => {
                        setSelectedRole(role);
                      }}
                    />
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
      </Container>
      <AddRoleModal
        isOpen={isAddModalOpen}
        closeModal={closeAddModal}
      ></AddRoleModal>
      <EditRoleModal
        closeModal={closeEditModal}
        isOpen={isEditModalOpen}
        formData={selectedRole}
      ></EditRoleModal>
    </>
  );
};

export default AccessControlPage;
