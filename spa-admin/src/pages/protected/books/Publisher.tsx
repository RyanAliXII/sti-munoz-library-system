import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import Modal from "react-responsive-modal";
import { toast } from "react-toastify";
import { DangerConfirmDialog } from "../../../components/dialog/Dialog";
import {
  DangerButton,
  DANGER_BTN_DEFAULT_CLASS,
  Input,
  LighButton,
  PrimaryButton,
  SecondaryButton,
  SECONDARY_BTN_DEFAULT_CLASS,
} from "../../../components/forms/Forms";
import LoadingBoundary from "../../../components/loader/LoadingBoundary";

import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  TrBody,
  TrHead,
} from "../../../components/table/Table";
import axiosClient from "../../../definitions/configs/axios";
import { EditModalProps, ModalProps } from "../../../definitions/types";
import { ErrorMsg } from "../../../definitions/var";
import { useForm } from "../../../hooks/useForm";
import { useSwitch, useToggleManual } from "../../../hooks/useToggle";
import { PublisherSchema } from "./schema";

type Publisher = {
  id?: number;
  name: string;
};
const PUBLISHER_FORM_DEFAULT_VALUES = { name: "" };
const Publisher = () => {
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

  const fetchPublisher = async () => {
    try {
      const { data: response } = await axiosClient.get("/publishers/");
      return response?.data?.publishers || [];
    } catch (error) {
      console.error(error);
      toast.error(ErrorMsg.Get);
    }
    return [];
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => axiosClient.delete(`/publishers/${selectedRow.id}/`),
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
    mutation.mutate();
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
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold ">Publishers</h1>
        </div>
        <div className="mb-4">
          <PrimaryButton
            buttonText="Add Publisher"
            props={{ onClick: openAddModal }}
          ></PrimaryButton>
        </div>

        <LoadingBoundary isLoading={isLoading} isError={isError}>
          <div className="w-full">
            <Table>
              <Thead>
                <TrHead>
                  <Th>Publisher</Th>
                  <Th></Th>
                </TrHead>
              </Thead>
              <Tbody>
                {publishers?.map((publisher) => {
                  return (
                    <TrBody key={publisher.id}>
                      <Td>{publisher.name}</Td>
                      <Td props={{ className: "p-2 flex gap-2 items-center" }}>
                        <SecondaryButton
                          props={{
                            className: `${SECONDARY_BTN_DEFAULT_CLASS} flex items-center gap-1 text-sm`,
                            onClick: () => {
                              setSelectedRow({ ...publisher });
                              openEditModal();
                            },
                          }}
                        >
                          <AiOutlineEdit />
                        </SecondaryButton>
                        <DangerButton
                          props={{
                            className: `${DANGER_BTN_DEFAULT_CLASS} bg-red-500 flex items-center gap-1 text-sm`,
                            onClick: () => {
                              openConfirmDialog();
                              setSelectedRow({ ...publisher });
                            },
                          }}
                        >
                          {" "}
                          <AiOutlineDelete />
                        </DangerButton>
                      </Td>
                    </TrBody>
                  );
                })}
              </Tbody>
            </Table>
          </div>
        </LoadingBoundary>
      </div>
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
  const PUBLISHER_FORM_DEFAULT_VALUES = { name: "" };
  const { errors, form, validate, handleFormInput } = useForm<Publisher>({
    default: PUBLISHER_FORM_DEFAULT_VALUES,
    schema: PublisherSchema,
  });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => axiosClient.post("/publishers/", form),
    onSuccess: () => {
      toast.success("New publisher has been added.");
      queryClient.invalidateQueries(["publishers"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
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
            <h1 className="text-xl font-medium">New Publisher</h1>
          </div>
          <div className="px-2">
            <Input
              labelText="Publisher name"
              error={errors?.name}
              props={{
                type: "text",
                name: "name",
                value: form.name,
                onChange: handleFormInput,
              }}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Add publisher</PrimaryButton>
            <LighButton props={{ onClick: closeModal, type: "button" }}>
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
      default: PUBLISHER_FORM_DEFAULT_VALUES,
      schema: PublisherSchema,
    });

  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => axiosClient.put(`/publishers/${formData.id}/`, form),
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
              labelText="Publisher name"
              error={errors?.name}
              props={{
                type: "text",
                name: "name",
                value: form.name,
                onChange: handleFormInput,
              }}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Update publisher</PrimaryButton>
            <LighButton props={{ onClick: closeModal, type: "button" }}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default Publisher;
