import { PrimaryButton, Input, LighButton } from "@components/forms/Forms";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useSwitch } from "@hooks/useToggle";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@definitions/configs/axios";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { CreateAuthorSchema } from "./schema";
import { useForm } from "@hooks/useForm";
import { toast } from "react-toastify";
import { DangerConfirmDialog } from "@components/dialog/Dialog";
import { Author } from "@definitions/types";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  HeadingRow,
  BodyRow,
} from "@components/table/Table";
import { EditModalProps, ModalProps } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";

const ADD_AUTHOR_DEFAULT: Omit<Author, "id"> = {
  givenName: "",
  middleName: "",
  surname: "",
};

const EDIT_AUTHOR_DEFAULT: Author = {
  id: 0,
  givenName: "",
  middleName: "",
  surname: "",
};

const AuthorPage = () => {
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

  const [selectedRow, setSelectedRow] = useState<Author>(EDIT_AUTHOR_DEFAULT);

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
      <div className="w-full lg:w-11/12  p-6 lg:p-2  mx-auto mb-5  flex gap-2">
        <div className="flex gap-2">
          <h1 className="text-3xl font-bold text-gray-700">Authors</h1>
          <PrimaryButton onClick={openAddModal}> New Author</PrimaryButton>
        </div>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto">
        <LoadingBoundary isLoading={isLoading} isError={isError}>
          <div className="w-full">
            <Table>
              <Thead>
                <HeadingRow>
                  <Th>Given name</Th>
                  <Th>Middle name/initial</Th>
                  <Th>Surname</Th>
                  <Th></Th>
                </HeadingRow>
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
        isOpen={isConfirmDialogOpen}
        title="Delete Author"
        text="Are you sure that you want to delete this author?"
        onConfirm={onConfirmDialog}
      />
    </>
  );
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
    <BodyRow>
      <Td>{author.givenName}</Td>
      <Td>{author.middleName}</Td>
      <Td>{author.surname}</Td>
      <Td className="p-2 flex gap-2 items-center">
        <AiOutlineEdit
          className="cursor-pointer text-yellow-400 text-xl"
          onClick={openEditModal}
        />
        <AiOutlineDelete
          className="cursor-pointer text-orange-600  text-xl"
          onClick={openDialog}
        />
      </Td>
    </BodyRow>
  );
};

const AddAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { form, errors, validate, handleFormInput, resetForm } = useForm<
    Omit<Author, "id">
  >({
    initialFormData: ADD_AUTHOR_DEFAULT,
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
      closeModal();
      resetForm();
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
              label="Given name"
              error={errors?.givenName}
              type="text"
              name="givenName"
              onChange={handleFormInput}
              value={form.givenName}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Middle name/initial"
              error={errors?.middleName}
              type="text"
              name="middleName"
              onChange={handleFormInput}
              value={form.middleName}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Surname"
              error={errors?.surname}
              type="text"
              name="surname"
              onChange={handleFormInput}
              value={form.surname}
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Add author</PrimaryButton>
            <LighButton type="button" onClick={closeModal}>
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
  const { form, errors, removeErrors, setForm, validate, handleFormInput } =
    useForm<Author>({
      initialFormData: EDIT_AUTHOR_DEFAULT,
      schema: CreateAuthorSchema,
    });
  useEffect(() => {
    setForm(() => {
      return { ...formData };
    });
  }, [formData]);
  useEffect(() => {
    if (!isOpen) {
      removeErrors();
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
              label="Given name"
              error={errors?.givenName}
              type="text"
              name="givenName"
              onChange={handleFormInput}
              value={form.givenName}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Middle name/initial"
              error={errors?.middleName}
              type="text"
              name="middleName"
              onChange={handleFormInput}
              value={form.middleName}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Surname"
              error={errors?.surname}
              type="text"
              name="surname"
              onChange={handleFormInput}
              value={form.surname}
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Update author</PrimaryButton>
            <LighButton onClick={closeModal} type="button">
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AuthorPage;
