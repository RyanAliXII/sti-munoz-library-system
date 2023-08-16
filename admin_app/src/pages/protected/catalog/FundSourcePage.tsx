import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import Modal from "react-responsive-modal";
import { toast } from "react-toastify";

import { Input } from "@components/ui/form/Input";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  BodyRow,
  HeadingRow,
} from "@components/ui/table/Table";

import { EditModalProps, ModalProps, Source } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useSwitch } from "@hooks/useToggle";
import { SourceofFundSchema } from "./schema";

import {
  ButtonClasses,
  LighButton,
  PrimaryButton,
} from "@components/ui/button/Button";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { useRequest } from "@hooks/useRequest";
import HasAccess from "@components/auth/HasAccess";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import { apiScope } from "@definitions/configs/msal/scopes";
import Tippy from "@tippyjs/react";
const SOURCE_FORM_DEFAULT_VALUES = { name: "" };
const FundSourcePage = () => {
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
  const { Get, Delete } = useRequest();
  const mutation = useMutation({
    mutationFn: () =>
      Delete(`/source-of-funds/${selectedRow.id}/`, {}, [
        apiScope("SOF.Delete"),
      ]),
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
      const { data: response } = await Get("/source-of-funds/", {}, [
        apiScope("SOF.Read"),
      ]);
      return response.data.sources ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const {
    data: sources,
    isError,
    isFetching,
  } = useQuery<Source[]>({
    queryFn: fetchSources,
    queryKey: ["sources"],
  });
  return (
    <>
      <ContainerNoBackground>
        <div className="w-full flex gap-2 justify-between">
          <h1 className="text-3xl font-bold text-gray-700">Source of Fund</h1>
          <HasAccess requiredPermissions={["FundSource.Access"]}>
            <PrimaryButton onClick={openAddModal}>New Source</PrimaryButton>
          </HasAccess>
        </div>
      </ContainerNoBackground>
      <LoadingBoundary isLoading={isFetching} isError={isError}>
        <Container className="lg:px-0">
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
                        <HasAccess requiredPermissions={["FundSource.Access"]}>
                          <Tippy content="Edit">
                            <button
                              className={
                                ButtonClasses.SecondaryOutlineButtonClasslist
                              }
                              onClick={() => {
                                setSelectedRow({ ...source });
                                openEditModal();
                              }}
                            >
                              <AiOutlineEdit className="cursor-pointer  text-xl" />
                            </button>
                          </Tippy>
                        </HasAccess>
                        <HasAccess requiredPermissions={["FundSource.Access"]}>
                          <Tippy content="Delete">
                            <button
                              className={
                                ButtonClasses.DangerButtonOutlineClasslist
                              }
                              onClick={() => {
                                openConfirmDialog();
                                setSelectedRow({ ...source });
                              }}
                            >
                              <AiOutlineDelete className="cursor-pointer text-xl" />
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
      <HasAccess requiredPermissions={["FundSource.Access"]}>
        <AddSourceModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      </HasAccess>
      <HasAccess requiredPermissions={["FundSource.Access"]}>
        <EditSourceModal
          isOpen={isEditModalOpen}
          closeModal={closeEditModal}
          formData={selectedRow}
        />
      </HasAccess>
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
  const { errors, form, validate, handleFormInput, resetForm } =
    useForm<Source>({
      initialFormData: SOURCE_FORM_DEFAULT_VALUES,
      schema: SourceofFundSchema,
    });
  const { Post } = useRequest();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      Post("/source-of-funds/", form, {}, [apiScope("SOF.Add")]),
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
      resetForm();
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
    initialFormData: SOURCE_FORM_DEFAULT_VALUES,
    schema: SourceofFundSchema,
  });
  const { Put } = useRequest();
  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      Put(`/source-of-funds/${formData.id}/`, form, {}, [apiScope("SOF.Edit")]),
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

export default FundSourcePage;
