import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import Modal from "react-responsive-modal";
import { toast } from "react-toastify";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { Input } from "@components/ui/form/Input";
import {
  ButtonClasses,
  LighButton,
  PrimaryButton,
} from "@components/ui/button/Button";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";

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
import { useRequest } from "@hooks/useRequest";
import { apiScope } from "@definitions/configs/msal/scopes";
import HasAccess from "@components/auth/HasAccess";
import Tippy from "@tippyjs/react";
import usePaginate from "@hooks/usePaginate";
import ReactPaginate from "react-paginate";
const PUBLISHER_FORM_DEFAULT_VALUES = { name: "" };
const PublisherPage = () => {
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
  const {
    currentPage,
    setCurrentPage,
    setTotalPages,
    totalPages,
    previousPage,
  } = usePaginate({
    initialPage: 1,
    numberOfPages: 0,
  });
  const fetchPublisher = async () => {
    try {
      const { data: response } = await Get(
        "/publishers/",
        {
          params: {
            page: currentPage,
          },
        },
        [apiScope("Publisher.Read")]
      );
      setTotalPages(response?.data?.metaData?.pages);
      return response?.data?.publishers || [];
    } catch (error) {
      toast.error(ErrorMsg.Get);
    }
    return [];
  };
  const queryClient = useQueryClient();
  const deletePublisher = useMutation({
    mutationFn: () =>
      Delete(`/publishers/${selectedRow.id}/`, {}, [
        apiScope("Publisher.Delete"),
      ]),
    onSuccess: () => {
      if (publishers?.length === 1 && totalPages > 1) {
        previousPage();
      } else {
        queryClient.invalidateQueries(["publishers"]);
      }

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
    isFetching,
    isError,
  } = useQuery<Publisher[]>({
    queryFn: fetchPublisher,
    queryKey: ["publishers", currentPage],
  });
  const paginationClass =
    totalPages <= 1 ? "hidden" : "flex gap-2 items-center";
  return (
    <>
      <ContainerNoBackground>
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-gray-700">Publishers</h1>
          <HasAccess requiredPermissions={["Publisher.Access"]}>
            <PrimaryButton onClick={openAddModal}>New Publisher</PrimaryButton>
          </HasAccess>
        </div>
      </ContainerNoBackground>
      <LoadingBoundaryV2
        isLoading={isFetching}
        isError={isError}
        contentLoadDelay={150}
      >
        <Container className="lg:px-0">
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
                        <HasAccess requiredPermissions={["Publisher.Access"]}>
                          <Tippy content="Edit">
                            <button
                              onClick={() => {
                                setSelectedRow({ ...publisher });
                                openEditModal();
                              }}
                              className={
                                ButtonClasses.SecondaryOutlineButtonClasslist
                              }
                            >
                              <AiOutlineEdit className="cursor-pointer  text-xl" />
                            </button>
                          </Tippy>
                        </HasAccess>
                        <HasAccess requiredPermissions={["Publisher.Access"]}>
                          <Tippy content="Delete">
                            <button
                              className={
                                ButtonClasses.DangerButtonOutlineClasslist
                              }
                              onClick={() => {
                                openConfirmDialog();
                                setSelectedRow({ ...publisher });
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
        <ContainerNoBackground>
          <ReactPaginate
            nextLabel="Next"
            pageLinkClassName="border px-3 py-0.5  text-center rounded"
            pageRangeDisplayed={5}
            pageCount={totalPages}
            disabledClassName="opacity-60 pointer-events-none"
            onPageChange={({ selected }) => {
              setCurrentPage(selected + 1);
            }}
            className={paginationClass}
            previousLabel="Previous"
            previousClassName="px-2 border text-gray-500 py-1 rounded"
            nextClassName="px-2 border text-blue-500 py-1 rounded"
            renderOnZeroPageCount={null}
            activeClassName="border-none bg-blue-500 text-white rounded"
          />
        </ContainerNoBackground>
      </LoadingBoundaryV2>

      <HasAccess requiredPermissions={["Publisher.Access"]}>
        <AddPublisherModal closeModal={closeAddModal} isOpen={isAddModalOpen} />
      </HasAccess>
      <HasAccess requiredPermissions={["Publisher.Access"]}>
        <EditPublisherModal
          closeModal={closeEditModal}
          isOpen={isEditModalOpen}
          formData={selectedRow}
        />
      </HasAccess>
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
