import { Author, ModalProps, PersonAuthor } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { BaseSyntheticEvent } from "react";
import { toast } from "react-toastify";
import { CreateAuthorSchema } from "../schema";

import { CustomInput } from "@components/ui/form/Input";

import { Button, Modal } from "flowbite-react";
import { useBookAddFormContext } from "./BookAddFormContext";

export const ADD_AUTHOR_INITIAL_FORM: Omit<PersonAuthor, "id"> = {
  givenName: "",
  middleName: "",
  surname: "",
};

const AddAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  return (
    <Modal show={isOpen} dismissible onClose={closeModal} size={"lg"}>
      <Modal.Header>
        <span>New Author</span>
      </Modal.Header>
      <Modal.Body>
        <div>
          <AuthorForm closeModal={closeModal} isOpen={isOpen} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

const AuthorForm = ({
  closeModal,
}: {
  closeModal: () => void;
  isOpen: boolean;
}) => {
  const { form, errors, validate, handleFormInput, resetForm } = useForm<
    Omit<Author, "id">
  >({
    initialFormData: {
      name: "",
    },
    schema: CreateAuthorSchema,
  });

  const { setForm: setAddBookForm } = useBookAddFormContext();
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
  const { Post } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Post("/authors/", form, {}),
    onSuccess: (response) => {
      toast.success("New author has been added.");
      queryClient.invalidateQueries(["authors"]);
      const { data } = response.data;
      if (data?.author?.id) {
        const author = data?.author as Author;
        setAddBookForm((prev) => ({
          ...prev,
          authors: [...prev.authors, author],
        }));
      }
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

  return (
    <form onSubmit={submit}>
      <div>
        <CustomInput
          label="Peron's name or organization's name"
          error={errors?.name}
          type="text"
          name="name"
          onChange={handleFormInput}
          value={form.name}
        />
      </div>

      <div className="flex gap-1 mt-3">
        <Button color="primary" type="submit">
          Add author
        </Button>
        <Button color="light" type="button" onClick={closeModal}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddAuthorModal;
