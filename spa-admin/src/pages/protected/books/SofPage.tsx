import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import Modal from "react-responsive-modal";
import { toast } from "react-toastify";
import { DangerConfirmDialog } from "../../../components/dialog/Dialog";
import {
  DangerButton,
  Input,
  LighButton,
  PrimaryButton,
  SecondaryButton,
} from "@components/forms/Forms";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  BodyRow,
  HeadingRow,
} from "@components/table/Table";
import axiosClient from "@definitions/configs/axios";
import { EditModalProps, ModalProps, Source } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useSwitch } from "@hooks/useToggle";
import { SourceofFundSchema } from "./schema";

const SOURCE_FORM_DEFAULT_VALUES = { name: "" };
const SofPage = () => {
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

  const [selectedRow, setSelectedRow] = useState<Source>(
    SOURCE_FORM_DEFAULT_VALUES
  );

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => axiosClient.delete(`/source-of-funds/${selectedRow.id}/`),
    onSuccess: () => {
      toast.success("Source deleted.");
      queryClient.invalidateQueries(["sources"]);
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
          <PrimaryButton onClick={openAddModal}>Add Source</PrimaryButton>
        </div>
        {/* <LoadingBoundary isLoading={isLoading} isError={isError}> */}
        <div className="w-full">
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Source of fund</Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {sources?.map((source) => {
                return (
                  <BodyRow key={source.id}>
                    <Td>{source.name}</Td>
                    <Td className="p-2 flex gap-2 items-center">
                      <AiOutlineEdit
                        className="cursor-pointer text-yellow-400 text-xl"
                        onClick={() => {
                          setSelectedRow({ ...source });
                          openEditModal();
                        }}
                      />
                      <AiOutlineDelete
                        className="cursor-pointer text-orange-600  text-xl"
                        onClick={() => {
                          openConfirmDialog();
                          setSelectedRow({ ...source });
                        }}
                      />
                    </Td>
                  </BodyRow>
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
        isOpen={isConfirmDialogOpen}
        title="Delete Source"
        text="Are you sure that you want to delete this source?"
        onConfirm={onConfirmDialog}
      />
    </>
  );
};

const AddSourceModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { errors, form, validate, handleFormInput } = useForm<Source>({
    default: SOURCE_FORM_DEFAULT_VALUES,
    schema: SourceofFundSchema,
  });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => axiosClient.post("/source-of-funds/", form),
    onSuccess: () => {
      toast.success("New source has been added.");
      queryClient.invalidateQueries(["sources"]);
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
            <h1 className="text-xl font-medium">New Source</h1>
          </div>
          <div className="px-2">
            <Input
              label="Fund Source"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Add Source</PrimaryButton>
            <LighButton onClick={closeModal} type="button">
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
  const { errors, form, setForm, validate, handleFormInput } = useForm<Source>({
    default: SOURCE_FORM_DEFAULT_VALUES,
    schema: SourceofFundSchema,
  });

  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => axiosClient.put(`/source-of-funds/${formData.id}/`, form),
    onSuccess: () => {
      toast.success("Source has been updated");
      queryClient.invalidateQueries(["sources"]);
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
            <h1 className="text-xl font-medium">Edit Source</h1>
          </div>
          <div className="px-2">
            <Input
              label="Fund Source"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Update source</PrimaryButton>
            <LighButton onClick={closeModal} type="button">
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SofPage;
