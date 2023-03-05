import {
  LightOutlineButton,
  PrimaryButton,
} from "@components/ui/button/Button";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { Input } from "@components/ui/form/Input";
import {
  HeadingRow,
  Table,
  Tbody,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { ModalProps } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";

import Modal from "react-responsive-modal";

const AccessControlPage = () => {
  const {
    isOpen: isAddModalOpen,
    close: closeAddModal,
    open: openAddModal,
  } = useSwitch();

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
            </HeadingRow>
          </Thead>
          <Tbody></Tbody>
        </Table>
      </Container>
      <AddRoleModal
        isOpen={isAddModalOpen}
        closeModal={closeAddModal}
      ></AddRoleModal>
    </>
  );
};

const AddRoleModal = ({ closeModal, isOpen }: ModalProps) => {
  const { Get } = useRequest();
  const fetchPermissions = async () => {
    try {
      const { data: response } = await Get("/system/permissions");
      console.log(response?.data?.permissions);
      return response?.data?.permissions ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const {} = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });
  if (!isOpen) return null;
  return (
    <Modal
      center
      onClose={closeModal}
      open={isOpen}
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
    >
      <form>
        <div className="w-full mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">Create role</h1>
          </div>
          <Input type="text" name="name"></Input>
          <div className="flex gap-2">
            <PrimaryButton>Create role</PrimaryButton>
            <LightOutlineButton>Cancel</LightOutlineButton>
          </div>
        </div>
        <div></div>
      </form>
    </Modal>
  );
};

export default AccessControlPage;
