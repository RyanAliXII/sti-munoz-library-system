import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import Modal from "react-responsive-modal";
import { toast } from "react-toastify";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { Input } from "@components/ui/form/Input";
import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import LoadingBoundary from "@components/loader/LoadingBoundary";

import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  HeadingRow,
  BodyRow,
} from "@components/ui/table/Table";

import { EditModalProps, ModalProps } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useSwitch } from "@hooks/useToggle";
import { PublisherSchema } from "./schema";
import { Publisher } from "@definitions/types";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { useMsal } from "@azure/msal-react";
import { SCOPES } from "@definitions/configs/msal/msal.config";
import { useRequest } from "@hooks/useRequest";
const PUBLISHER_FORM_DEFAULT_VALUES = { name: "" };
const PublisherPage = () => {
  const { instance: msal } = useMsal();
  const {
    isOpen: isAddModalOpen,
    open: openAddModal,
    close: closeAddModal,
  } = useSwitch();

  const {
    isOpen: isEditModalOpen,
    open: openEditModal,
    close: closeEditModal,
  } = useSwitch();
  const {
    isOpen: isConfirmDialogOpen,
    open: openConfirmDialog,
    close: closeConfirmDialog,
  } = useSwitch();

  const [selectedRow, setSelectedRow] = useState<Publisher>(
    PUBLISHER_FORM_DEFAULT_VALUES
  );
  const { Get, Delete } = useRequest();
  const fetchPublisher = async () => {
    try {
      const { data: response } = await Get("/publishers/", {}, [
        SCOPES.pulisher.delete,
      ]);
      return response?.data?.publishers || [];
    } catch (error) {
      toast.error(ErrorMsg.Get);
    }
    return [];
  };
  const queryClient = useQueryClient();
  const deletePublisher = useMutation({
    mutationFn: () => Delete(`/publishers/${selectedRow.id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["publishers"]);
      toast.success("Publisher deleted.");
    },
    onError: (error) => {
      console.error(error);
      toast.error(ErrorMsg.Delete);
    },
    onSettled: () => {
      closeConfirmDialog();
    },
  });
  const onConfirmDialog = () => {
    deletePublisher.mutate();
  };

  const {
    data: publishers,
    isLoading,
    isError,
  } = useQuery<Publisher[]>({
    queryFn: fetchPublisher,
    queryKey: ["publishers"],
  });

  return (
    <>
      <ContainerNoBackground>
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-gray-700">Publishers</h1>
          <PrimaryButton onClick={openAddModal}>New Publisher</PrimaryButton>
        </div>
      </ContainerNoBackground>
      <Container className="lg:px-0">
        <LoadingBoundary isLoading={isLoading} isError={isError}>
          <div className="w-full">
            <Table>
              <Thead>
                <HeadingRow>
                  <Th>Publisher</Th>
                  <Th></Th>
                </HeadingRow>
              </Thead>
              <Tbody>
                {publishers?.map((publisher) => {
                  return (
                    <BodyRow key={publisher.id}>
                      <Td>{publisher.name}</Td>
                      <Td className="p-2 flex gap-2 items-center">
                        <AiOutlineEdit
                          className="cursor-pointer text-yellow-400 text-xl"
                          onClick={() => {
                            setSelectedRow({ ...publisher });
                            openEditModal();
                          }}
                        />
                        <AiOutlineDelete
                          className="cursor-pointer text-orange-600  text-xl"
                          onClick={() => {
                            openConfirmDialog();
                            setSelectedRow({ ...publisher });
                          }}
                        />
                      </Td>
                    </BodyRow>
                  );
                })}
              </Tbody>
            </Table>
          </div>
        </LoadingBoundary>
      </Container>
      <AddPublisherModal closeModal={closeAddModal} isOpen={isAddModalOpen} />
      <EditPublisherModal
        closeModal={closeEditModal}
        isOpen={isEditModalOpen}
        formData={selectedRow}
      />
      <DangerConfirmDialog
        close={closeConfirmDialog}
        isOpen={isConfirmDialogOpen}
        title="Delete Publisher"
        text="Are you sure you want to delete this publisher?"
        onConfirm={onConfirmDialog}
      ></DangerConfirmDialog>
    </>
  );
};

const AddPublisherModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { errors, form, validate, handleFormInput, resetForm } =
    useForm<Publisher>({
      initialFormData: PUBLISHER_FORM_DEFAULT_VALUES,
      schema: PublisherSchema,
    });
  const { Post } = useRequest();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => Post("/publishers/", form, {}),
    onSuccess: () => {
      toast.success("New publisher has been added.");
      queryClient.invalidateQueries(["publishers"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      resetForm();
      closeModal();
    },
  });

  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      await validate();
      mutation.mutate();
    } catch (error) {
      console.error(error);
    }
  };
  if (!isOpen) return null;
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-46 mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">New Publisher</h1>
          </div>
          <div className="px-2">
            <Input
              label="Publisher name"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Add publisher</PrimaryButton>
            <LighButton onClick={closeModal} type="button">
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};
const EditPublisherModal: React.FC<EditModalProps<Publisher>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const { errors, form, setForm, validate, handleFormInput } =
    useForm<Publisher>({
      initialFormData: PUBLISHER_FORM_DEFAULT_VALUES,
      schema: PublisherSchema,
    });

  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);

  const queryClient = useQueryClient();
  const { Put } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Put(`/publishers/${formData.id}/`, form),
    onSuccess: () => {
      toast.success("Publisher has been updated.");
      queryClient.invalidateQueries(["publishers"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.Update);
      console.error(error);
    },
    onSettled: () => {
      closeModal();
    },
  });

  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      await validate();
      mutation.mutate();
    } catch (error) {
      console.error(error);
    }
  };
  if (!isOpen) return null;
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-46 mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">Edit Publisher</h1>
          </div>
          <div className="px-2">
            <Input
              label="Publisher name"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Update publisher</PrimaryButton>
            <LighButton onClick={closeModal} type="button">
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PublisherPage;
