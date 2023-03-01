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
import { useSwitch } from "@hooks/useToggle";
import AddOrganizationModal from "./AddOrganizationModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "@definitions/configs/axios";
import { Organization } from "@definitions/types";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { useState } from "react";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import EditOrganizationModal from "./EditOrganizationModal";

const OrganizationAsAuthor = () => {
  const [selectedRow, setSelectedRow] = useState<Organization>({
    id: 0,
    name: "",
  });
  const { close, isOpen, open } = useSwitch();
  const {
    close: closeConfirmDialog,
    isOpen: isConfirmDialogOpen,
    open: openConfirmDialog,
  } = useSwitch();

  const {
    close: closeEditModal,
    isOpen: isEditModalOpen,
    open: openEditModal,
  } = useSwitch();
  const fetchOrganizations = async () => {
    try {
      const { data: response } = await axiosClient.get(
        "/authors/organizations"
      );

      return response?.data?.organizations || [];
    } catch {
      return [];
    }
  };
  const { data: organizations, refetch } = useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  });
  const proceedToDelete = () => {
    deleteOrganization.mutate();
  };
  const deleteOrganization = useMutation({
    mutationFn: () =>
      axiosClient.delete(`/authors/organizations/${selectedRow.id}`),
    onSuccess: () => {
      toast.success("Organization deleted.");
    },
    onError: () => {
      toast.error(ErrorMsg.Delete);
    },
    onSettled: () => {
      closeConfirmDialog();
      refetch();
    },
  });
  return (
    <>
      <ContainerNoBackground className="flex gap-2">
        <div className="w-full">
          <PrimaryButton
            onClick={() => {
              open();
            }}
          >
            New Organization
          </PrimaryButton>
        </div>
      </ContainerNoBackground>
      <Container className="lg:px-0">
        <div className="w-full">
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Organization</Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {organizations?.map((org) => {
                return (
                  <BodyRow key={org.id}>
                    <Td>{org.name}</Td>
                    <Td className="p-2 flex gap-2 items-center">
                      <AiOutlineEdit
                        className="cursor-pointer text-yellow-400 text-xl"
                        onClick={() => {
                          setSelectedRow({ ...org });
                          openEditModal();
                        }}
                      />
                      <AiOutlineDelete
                        className="cursor-pointer text-orange-600  text-xl"
                        onClick={() => {
                          openConfirmDialog();
                          setSelectedRow({ ...org });
                        }}
                      />
                    </Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </div>
      </Container>
      <DangerConfirmDialog
        close={closeConfirmDialog}
        isOpen={isConfirmDialogOpen}
        onConfirm={proceedToDelete}
        title="Delete organization"
        text="Are you sure you want to delete this organization ?"
      ></DangerConfirmDialog>
      <AddOrganizationModal
        closeModal={close}
        isOpen={isOpen}
        refetch={() => {
          refetch();
        }}
      />
      <EditOrganizationModal
        closeModal={closeEditModal}
        isOpen={isEditModalOpen}
        formData={selectedRow}
        refetch={() => {
          refetch();
        }}
      ></EditOrganizationModal>
    </>
  );
};

export default OrganizationAsAuthor;
