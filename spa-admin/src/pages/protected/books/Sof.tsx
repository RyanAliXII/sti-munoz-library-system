import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusCodes } from "http-status-codes";
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
import { useToggleManual } from "../../../hooks/useToggle";
import { SourceofFundSchema } from "./schema";

type Source = {
  id?: number;
  name: string;
};
const SOURCE_FORM_DEFAULT_VALUES = { name: "" };
const Sof = () => {
  const { value: isAddModalOpen, set: setAddModalState } = useToggleManual();
  const { value: isEditModalOpen, set: setEditModalState } = useToggleManual();
  const { value: isDialogOpen, set: setDialogState } = useToggleManual();
  const [selectedRow, setSelectedRow] = useState<Source>(
    SOURCE_FORM_DEFAULT_VALUES
  );
  const openAddModal = () => {
    setAddModalState(true);
  };
  const closeAddModal = () => {
    setAddModalState(false);
  };
  const openEditModal = () => {
    setEditModalState(true);
  };
  const closeEditModal = () => {
    setEditModalState(false);
  };
  const openConfirmDialog = () => {
    setDialogState(true);
  };
  const closeConfirmDialog = () => {
    setDialogState(false);
  };

  const queryClient = useQueryClient();
  const deleteAuthor = async () => {
    try {
      const response = await axiosClient.delete(
        `/source-of-funds/${selectedRow.id}/`
      );
      if (response.status === StatusCodes.OK) {
        toast.success("Source deleted.");
      }
    } catch (error) {
      console.error(error);
      toast.error(ErrorMsg.Delete);
    } finally {
      closeConfirmDialog();
    }
  };
  const mutation = useMutation({
    mutationFn: deleteAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries(["sources"]);
    },
  });
  const onConfirmDialog = () => {
    mutation.mutate();
  };
  const fetchSources = async () => {
    try {
      const { data: response } = await axiosClient.get("/source-of-funds/");
      return response.data.sources ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const { data: sources } = useQuery<Source[]>({
    queryFn: fetchSources,
    queryKey: ["sources"],
  });
  return (
    <>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold ">Source of Funds</h1>
        </div>
        <div className="mb-4">
          <PrimaryButton
            buttonText="Add Source"
            props={{ onClick: openAddModal }}
          ></PrimaryButton>
        </div>
        {/* <LoadingBoundary isLoading={isLoading} isError={isError}> */}
        <div className="w-full">
          <Table>
            <Thead>
              <TrHead>
                <Th>Source of fund</Th>
                <Th></Th>
              </TrHead>
            </Thead>
            <Tbody>
              {sources?.map((source) => {
                console.log(source);
                return (
                  <TrBody key={source.id}>
                    <Td>{source.name}</Td>
                    <Td props={{ className: "p-2 flex gap-2 items-center" }}>
                      <SecondaryButton
                        props={{
                          className: `${SECONDARY_BTN_DEFAULT_CLASS} flex items-center gap-1 text-sm`,
                          onClick: () => {
                            setSelectedRow({ ...source });
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
                            setSelectedRow({ ...source });
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

        {/* </LoadingBoundar> */}
      </div>
      <AddSourceModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      <EditSourceModal
        isOpen={isEditModalOpen}
        closeModal={closeEditModal}
        formData={selectedRow}
      />
      <DangerConfirmDialog
        close={closeConfirmDialog}
        isOpen={isDialogOpen}
        title="Delete Source"
        text="Are you sure that you want to delete this source?"
        onConfirm={onConfirmDialog}
      />
    </>
  );
};

const AddSourceModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { errors, form, setForm, validate, clearErrorWithKey } =
    useForm<Source>({
      default: SOURCE_FORM_DEFAULT_VALUES,
      schema: SourceofFundSchema,
    });

  const newSource = async () => {
    try {
      const response = await axiosClient.post("/source-of-funds/", form);
      if (response.status === StatusCodes.OK) {
        toast.success("New source has been added.");
        queryClient.invalidateQueries(["sources"]);
      }
    } catch (error) {
      toast.error(ErrorMsg.New);
      console.error(error);
    } finally {
      closeModal();
    }
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: newSource });

  const handleFormInput = (event: BaseSyntheticEvent) => {
    const name = event.target.name;
    const value = event.target.value;
    clearErrorWithKey(name);
    setForm((prevForm) => {
      return { ...prevForm, [name]: value };
    });
  };
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
            <h1 className="text-xl font-medium">New Source</h1>
          </div>
          <div className="px-2">
            <Input
              labelText="Fund Source"
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
            <PrimaryButton>Add Source</PrimaryButton>
            <LighButton props={{ onClick: closeModal, type: "button" }}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};
const EditSourceModal: React.FC<EditModalProps<Source>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const { errors, form, setForm, validate, clearErrorWithKey } =
    useForm<Source>({
      default: SOURCE_FORM_DEFAULT_VALUES,
      schema: SourceofFundSchema,
    });

  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);
  const handleFormInput = (event: BaseSyntheticEvent) => {
    const name = event.target.name;
    const value = event.target.value;
    clearErrorWithKey(name);
    setForm((prevForm) => {
      return { ...prevForm, [name]: value };
    });
  };
  const queryClient = useQueryClient();
  const updatePublisher = async () => {
    try {
      const response = await axiosClient.put(
        `/source-of-funds/${formData.id}/`,
        form
      );
      if (response.status === StatusCodes.OK) {
        toast.success("Source has been updated");
      }
    } catch (error) {
      toast.error(ErrorMsg.Update);
      console.error(error);
    } finally {
      closeModal();
    }
  };
  const mutation = useMutation({
    mutationFn: updatePublisher,
    onSuccess: () => {
      queryClient.invalidateQueries(["sources"]);
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
            <h1 className="text-xl font-medium">Edit Source</h1>
          </div>
          <div className="px-2">
            <Input
              labelText="Fund Source"
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
            <PrimaryButton>Update source</PrimaryButton>
            <LighButton props={{ onClick: closeModal, type: "button" }}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default Sof;
