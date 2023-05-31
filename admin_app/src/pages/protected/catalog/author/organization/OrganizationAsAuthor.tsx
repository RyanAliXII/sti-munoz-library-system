import { ButtonClasses, PrimaryButton } from "@components/ui/button/Button";
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

import { Organization } from "@definitions/types";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { useState } from "react";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import EditOrganizationModal from "./EditOrganizationModal";
import { useRequest } from "@hooks/useRequest";
import HasAccess from "@components/auth/HasAccess";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import { apiScope } from "@definitions/configs/msal/scopes";
import Tippy from "@tippyjs/react";

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
  const { Get, Delete } = useRequest();
  const fetchOrganizations = async () => {
    try {
      const { data: response } = await Get("/authors/organizations", {}, [
        apiScope("Author.Read"),
      ]);
      return response?.data?.organizations || [];
    } catch {
      return [];
    }
  };
  const {
    data: organizations,
    refetch,
    isError,
    isFetching,
  } = useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  });
  const proceedToDelete = () => {
    deleteOrganization.mutate();
  };
  const deleteOrganization = useMutation({
    mutationFn: () => Delete(`/authors/organizations/${selectedRow.id}`),
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
          <HasAccess requiredPermissions={["Author.Add"]}>
            <PrimaryButton
              onClick={() => {
                open();
              }}
            >
              New Organization
            </PrimaryButton>
          </HasAccess>
        </div>
      </ContainerNoBackground>
      <LoadingBoundary isError={isError} isLoading={isFetching}>
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
                        <HasAccess requiredPermissions={["Author.Edit"]}>
                          <Tippy content="Edit Author">
                            <button
                              className={
                                ButtonClasses.SecondaryOutlineButtonClasslist
                              }
                              onClick={() => {
                                setSelectedRow({ ...org });
                                openEditModal();
                              }}
                            >
                              <AiOutlineEdit className="cursor-pointer  text-xl" />
                            </button>
                          </Tippy>
                        </HasAccess>
                        <HasAccess requiredPermissions={["Author.Delete"]}>
                          <Tippy content="Delete Author">
                            <button
                              className={
                                ButtonClasses.DangerButtonOutlineClasslist
                              }
                              onClick={() => {
                                openConfirmDialog();
                                setSelectedRow({ ...org });
                              }}
                            >
                              <AiOutlineDelete className="cursor-pointer  text-xl" />
                            </button>
                          </Tippy>
                        </HasAccess>
                      </Td>
                    </BodyRow>
                  );
                })}
              </Tbody>
            </Table>
          </div>
        </Container>
      </LoadingBoundary>
      <DangerConfirmDialog
        close={closeConfirmDialog}
        isOpen={isConfirmDialogOpen}
        onConfirm={proceedToDelete}
        title="Delete organization"
        text="Are you sure you want to delete this organization ?"
      ></DangerConfirmDialog>
      <HasAccess requiredPermissions={["Author.Add"]}>
        <AddOrganizationModal
          closeModal={close}
          isOpen={isOpen}
          refetch={() => {
            refetch();
          }}
        />
      </HasAccess>
      <HasAccess requiredPermissions={["Author.Edit"]}>
        <EditOrganizationModal
          closeModal={closeEditModal}
          isOpen={isEditModalOpen}
          formData={selectedRow}
          refetch={() => {
            refetch();
          }}
        />
      </HasAccess>
    </>
  );
};

export default OrganizationAsAuthor;
