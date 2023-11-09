import { Author, ModalProps } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { BaseSyntheticEvent } from "react";
import { toast } from "react-toastify";
import { CreateAuthorSchema } from "../schema";

import { CustomInput } from "@components/ui/form/Input";
import { Button, Modal } from "flowbite-react";
import { useBookEditFormContext } from "./BookEditFormContext";

export const ADD_AUTHOR_INITIAL_FORM: Omit<Author, "id"> = {
  name: "",
};

const AddAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size={"lg"}>
      <Modal.Header>New Author</Modal.Header>
      <Modal.Body>
        <AuthorForm closeModal={closeModal} />
      </Modal.Body>
    </Modal>
  );
};

const AuthorForm = ({ closeModal }: { closeModal: () => void }) => {
  const { form, errors, validate, handleFormInput, resetForm } = useForm<
    Omit<Author, "id">
  >({
    initialFormData: ADD_AUTHOR_INITIAL_FORM,
    schema: CreateAuthorSchema,
  });
  const { setForm: setBookEditForm } = useBookEditFormContext();
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
        setBookEditForm((prev) => ({
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
      <div className="w-full ">
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

        <div className="flex gap-1 py-3">
          <Button color="primary" type="submit">
            Add author
          </Button>
          <Button color="light" type="button" onClick={closeModal}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddAuthorModal;
