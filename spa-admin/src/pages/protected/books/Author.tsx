import {
  PrimaryButton,
  SecondaryButton,
  Input,
  SECONDARY_BTN_DEFAULT_CLASS,
  LighButton,
} from "../../../components/forms/Forms";
import { AiOutlineEdit } from "react-icons/ai";
import { useToggleManual } from "../../../hooks/useToggle";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../../definitions/configs/axios";
import LoadingBoundary from "../../../components/loader/LoadingBoundary";
import { BaseSyntheticEvent } from "react";
import { CreateAuthorSchema } from "./schema";
import { useForm } from "../../../hooks/useForm";
import { StatusCodes } from "http-status-codes";
import { toast } from "react-toastify";
const Author = () => {
  const { set: setAddModalState, value: isAddModalOpen } = useToggleManual();
  const { set: setEditModalState, value: isEditModalOpen } = useToggleManual();

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

  const fetchAuthors = async () => {
    try {
      const { data: response } = await axiosClient.get("/authors/");
      return response.data.authors ?? [];
    } catch (error) {
      return [];
    }
  };

  const {
    data: authors,
    isLoading,
    isError,
  } = useQuery<Author[]>({ queryFn: fetchAuthors, queryKey: ["authors"] });

  return (
    <>
      <div className="w-full h-full">
        <div>
          <h1 className="text-3xl font-bold ml-5 lg:ml-9 ">Authors</h1>
        </div>
        <div className="mx-auto mt-3 w-11/12 lg:ml-9">
          <PrimaryButton
            buttonText="Add author"
            props={{ onClick: openAddModal }}
          ></PrimaryButton>
        </div>
        <LoadingBoundary isLoading={isLoading} isError={isError}>
          <div className="w-full flex justify-center mt-5">
            <table className="w-11/12">
              <thead className="bg-gray-50 text-gray-700">
                <tr className="border border-l-0 border-r-0 border-t-0">
                  <th className="py-4 text-left px-2">Given name</th>
                  <th className="py-4 text-left">Middle name/initial</th>
                  <th className="py-4 text-left">Surname</th>
                  <th className="py-4 text-left"></th>
                </tr>
              </thead>

              <tbody>
                {authors?.map((author, index) => (
                  <AuthorTableRow
                    author={author}
                    openEditModal={openEditModal}
                    key={index}
                  ></AuthorTableRow>
                ))}
              </tbody>
            </table>
          </div>
        </LoadingBoundary>
      </div>
      <EditAuthorModal isOpen={isEditModalOpen} closeModal={closeEditModal} />
      <AddAuthorModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
    </>
  );
};

type Author = {
  givenName: string;
  middleName?: string;
  surname: string;
};
type AuthorTableRowType = {
  author: Author;
  openEditModal: () => void;
};
const AuthorTableRow: React.FC<AuthorTableRowType> = ({
  author,
  openEditModal,
}) => {
  return (
    <tr className="border border-l-0 border-r-0 border-t-0 text-gray-500 font-medium">
      <td className="p-2">{author.givenName}</td>
      <td className="p-2">{author.middleName}</td>
      <td className="p-2">{author.surname}</td>
      <td className="p-2">
        <SecondaryButton
          props={{
            className: `${SECONDARY_BTN_DEFAULT_CLASS} flex items-center gap-1 text-sm`,
            onClick: openEditModal,
          }}
        >
          <AiOutlineEdit /> Edit
        </SecondaryButton>
      </td>
    </tr>
  );
};
interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const AddAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const FORM_DEFAULT_VALUES: Author = {
    givenName: "",
    middleName: "",
    surname: "",
  };
  const { form, errors, setForm, validate, clearErrorWithKey } =
    useForm<Author>({
      default: FORM_DEFAULT_VALUES,
      schema: CreateAuthorSchema,
    });
  const queryClient = useQueryClient();
  const addNewAuthor = async () => {
    try {
      const response = await axiosClient.post("/authors/", form);
      if (response.status === StatusCodes.OK) {
        toast.success("New author has been added.");
        queryClient.invalidateQueries(["authors"]);
      }
    } catch {
      toast.error("Failed to add new author.");
    }
  };
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      await validate();
      mutation.mutate();
    } catch {}
  };
  const mutation = useMutation({ mutationFn: addNewAuthor });

  const handleFormInput = (event: BaseSyntheticEvent) => {
    const name = event.target.name;
    const value = event.target.value;
    clearErrorWithKey(name);
    setForm((prevForm) => {
      return {
        ...prevForm,
        [name]: value,
      };
    });
  };

  if (!isOpen) return null; //; temporary fix for react-responsive-modal bug

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-96">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">New Author</h1>
          </div>
          <div className="px-2 mb-1">
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
          <div className="px-2 mb-1">
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
const EditAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  if (!isOpen) return null; //; temporary fix for react-responsive-modal bug
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      center
    >
      <form>
        <div className="w-full h-96 mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">Edit Author</h1>
          </div>
          <div className="px-2">
            <Input
              labelText="Given name"
              props={{ type: "text", name: "givenName" }}
            />
          </div>
          <div className="px-2">
            <Input
              labelText="Middle name/initial"
              props={{ type: "text", name: "middlename" }}
            />
          </div>
          <div className="px-2">
            <Input
              labelText="Surname"
              props={{ type: "text", name: "surname" }}
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
