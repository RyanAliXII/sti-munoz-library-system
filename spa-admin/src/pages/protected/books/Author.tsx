import {
  PrimaryButton,
  SecondaryButton,
  Input,
  SECONDARY_BTN_DEFAULT_CLASS,
  DANGER_BTN_DEFAULT_CLASS,
  DangerButton,
  LighButton,
} from "../../../components/forms/Forms";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useToggleManual } from "../../../hooks/useToggle";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../../definitions/configs/axios";
import LoadingBoundary from "../../../components/loader/LoadingBoundary";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { CreateAuthorSchema } from "./schema";
import { useForm } from "../../../hooks/useForm";
import { toast } from "react-toastify";
import { DangerConfirmDialog } from "../../../components/dialog/Dialog";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  TrBody,
  TrHead,
} from "../../../components/table/Table";
import { EditModalProps, ModalProps } from "../../../definitions/types";
import { ErrorMsg } from "../../../definitions/var";

const AUTHOR_FORM_DEFAULT_VALUES: Author = {
  id: 0,
  givenName: "",
  middleName: "",
  surname: "",
};

const Author = () => {
  const { set: setAddModalState, value: isAddModalOpen } = useToggleManual();
  const { set: setEditModalState, value: isEditModalOpen } = useToggleManual();
  const { set: setDialogState, value: isDialogOpen } = useToggleManual();
  const [selectedRow, setSelectedRow] = useState<Author>(
    AUTHOR_FORM_DEFAULT_VALUES
  );
  const closeAddModal = () => {
    setAddModalState(false);
  };
  const openAddModal = () => {
    setAddModalState(true);
  };

  const closeEditModal = () => {
    setEditModalState(false);
  };
  const openEditModal = () => {
    setEditModalState(true);
  };
  const openConfirmDialog = () => {
    setDialogState(true);
  };
  const closeConfirmDialog = () => {
    setDialogState(false);
  };
  const fetchAuthors = async () => {
    try {
      const { data: response } = await axiosClient.get("/authors/");
      return response.data.authors ?? [];
    } catch (error) {
      toast.error(ErrorMsg.Get);
      console.error(error);
      return [];
    }
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => axiosClient.delete(`/authors/${selectedRow?.id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["authors"]);
      toast.success("Author has been deleted.");
    },
    onError: (error) => {
      toast.error(ErrorMsg.Delete);
      console.error(error);
    },
    onSettled: () => {
      closeConfirmDialog();
    },
  });
  const onConfirmDialog = () => {
    mutation.mutate();
  };
  const {
    data: authors,
    isLoading,
    isError,
  } = useQuery<Author[]>({ queryFn: fetchAuthors, queryKey: ["authors"] });
  return (
    <>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold ">Authors</h1>
        </div>
        <div className="mb-4">
          <PrimaryButton
            buttonText="Add author"
            props={{ onClick: openAddModal }}
          ></PrimaryButton>
        </div>

        <LoadingBoundary isLoading={isLoading} isError={isError}>
          <div className="w-full">
            <Table>
              <Thead>
                <TrHead>
                  <Th>Given name</Th>
                  <Th>Middle name/initial</Th>
                  <Th>Surname</Th>
                  <Th></Th>
                </TrHead>
              </Thead>

              <Tbody>
                {authors?.map((author, index) => (
                  <AuthorTableRow
                    author={author}
                    openEditModal={() => {
                      setSelectedRow({ ...author });
                      openEditModal();
                    }}
                    openDialog={() => {
                      setSelectedRow({ ...author });
                      openConfirmDialog();
                    }}
                    key={author.id}
                  ></AuthorTableRow>
                ))}
              </Tbody>
            </Table>
          </div>
        </LoadingBoundary>
      </div>
      <AddAuthorModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      <EditAuthorModal
        isOpen={isEditModalOpen}
        formData={selectedRow}
        closeModal={closeEditModal}
      />

      <DangerConfirmDialog
        close={closeConfirmDialog}
        isOpen={isDialogOpen}
        title="Delete Author"
        text="Are you sure that you want to delete this author?"
        onConfirm={onConfirmDialog}
      />
    </>
  );
};

type Author = {
  id?: number;
  givenName: string;
  middleName?: string;
  surname: string;
};
type AuthorTableRowType = {
  author: Author;
  openEditModal: () => void;
  openDialog?: () => void;
};
const AuthorTableRow: React.FC<AuthorTableRowType> = ({
  author,
  openEditModal,
  openDialog,
}) => {
  return (
    <TrBody>
      <Td>{author.givenName}</Td>
      <Td>{author.middleName}</Td>
      <Td>{author.surname}</Td>
      <Td props={{ className: "p-2 flex gap-2 items-center" }}>
        <SecondaryButton
          props={{
            className: `${SECONDARY_BTN_DEFAULT_CLASS} flex items-center gap-1 text-sm`,
            onClick: openEditModal,
          }}
        >
          <AiOutlineEdit />
        </SecondaryButton>
        <DangerButton
          props={{
            className: `${DANGER_BTN_DEFAULT_CLASS} bg-red-500 flex items-center gap-1 text-sm`,
            onClick: openDialog,
          }}
        >
          <AiOutlineDelete />
        </DangerButton>
      </Td>
    </TrBody>
  );
};

const AddAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { form, errors, setForm, validate, handleFormInput } = useForm<Author>({
    default: AUTHOR_FORM_DEFAULT_VALUES,
    schema: CreateAuthorSchema,
  });
  const queryClient = useQueryClient();
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      await validate();
      mutation.mutate();
    } catch (error) {
      console.error(error);
    }
  };
  const mutation = useMutation({
    mutationFn: () => axiosClient.post("/authors/", form),
    onSuccess: () => {
      toast.success("New author has been added.");
      queryClient.invalidateQueries(["authors"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      setForm({ ...AUTHOR_FORM_DEFAULT_VALUES });
      closeModal();
    },
  });

  if (!isOpen) return null; //; temporary fix for react-responsive-modal bug

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      showCloseIcon={false}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-96">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">New Author</h1>
          </div>
          <div className="px-2 mb-2">
            <Input
              labelText="Given name"
              error={errors?.givenName}
              props={{
                type: "text",
                name: "givenName",
                onChange: handleFormInput,
                value: form.givenName,
              }}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              labelText="Middle name/initial"
              error={errors?.middleName}
              props={{
                type: "text",
                name: "middleName",
                onChange: handleFormInput,
                value: form.middleName,
              }}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              labelText="Surname"
              error={errors?.surname}
              props={{
                type: "text",
                name: "surname",
                onChange: handleFormInput,
                value: form.surname,
              }}
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Add author</PrimaryButton>
            <LighButton props={{ onClick: closeModal, type: "button" }}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};
const EditAuthorModal: React.FC<EditModalProps<Author>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const { form, errors, clearErrors, setForm, validate, handleFormInput } =
    useForm<Author>({
      default: AUTHOR_FORM_DEFAULT_VALUES,
      schema: CreateAuthorSchema,
    });
  useEffect(() => {
    setForm(() => {
      return { ...formData };
    });
  }, [formData]);
  useEffect(() => {
    if (!isOpen) {
      clearErrors();
    }
  }, [isOpen]);

  const queryClient = useQueryClient();
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      await validate();
      mutation.mutate();
    } catch (error) {
      console.error(error);
    }
  };
  const mutation = useMutation({
    mutationFn: () => axiosClient.put(`/authors/${formData.id}/`, form),
    onSuccess: () => {
      toast.success("Author has been updated.");
      queryClient.invalidateQueries(["authors"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.Delete);
      console.error(error);
    },
    onSettled: () => {
      closeModal();
    },
  });
  if (!isOpen) return null; //; temporary fix for react-responsive-modal bug
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      showCloseIcon={false}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-96 mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">Edit Author</h1>
          </div>
          <div className="px-2 mb-2">
            <Input
              labelText="Given name"
              error={errors?.givenName}
              props={{
                type: "text",
                name: "givenName",
                value: form.givenName,
                onChange: handleFormInput,
              }}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              error={errors?.middleName}
              labelText="Middle name/initial"
              props={{
                type: "text",
                name: "middleName",
                value: form.middleName,
                onChange: handleFormInput,
              }}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              labelText="Surname"
              error={errors?.surname}
              props={{
                type: "text",
                name: "surname",
                value: form.surname,
                onChange: handleFormInput,
              }}
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Update author</PrimaryButton>
            <LighButton props={{ onClick: closeModal, type: "button" }}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default Author;
