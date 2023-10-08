import { Author, ModalProps } from "@definitions/types";
import React, { BaseSyntheticEvent, useState } from "react";
import { CreateAuthorSchema } from "../schema";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import Modal from "react-responsive-modal";
import { Input } from "@components/ui/form/Input";
import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import { useBookEditFormContext } from "./BookEditFormContext";
import { apiScope } from "@definitions/configs/msal/scopes";

export const ADD_AUTHOR_INITIAL_FORM: Omit<Author, "id"> = {
  name: "",
};

const AddAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"Person" | "Org">("Person");
  const activeTabClass =
    "basis-1/2 border-blue-500 flex justify-center rounded text-blue-500 rounded p-2";
  const nonActiveClass = "flex justify-center basis-1/2 p-2 text-gray-400";
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      styles={{ modal: { maxWidth: "500px" } }}
      classNames={{ modal: "w-11/12 md:w-9/12 lg:w-6/12 rounded" }}
      showCloseIcon={false}
      center
    >
      <div className="w-full  rounded  mb-5">
        <h1 className="text-lg p-3">New Author</h1>
        <div>
          <AuthorForm closeModal={closeModal} />
        </div>
      </div>
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
    mutationFn: () => Post("/authors/", form, {}, [apiScope("Author.Add")]),
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
        <div className="px-2 mb-2">
          <Input
            label="Peron's name or organization's name"
            error={errors?.name}
            type="text"
            name="name"
            onChange={handleFormInput}
            value={form.name}
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
  );
};

export default AddAuthorModal;
