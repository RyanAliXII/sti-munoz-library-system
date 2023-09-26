import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import { Input } from "@components/ui/form/Input";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseSyntheticEvent } from "react";
import Modal from "react-responsive-modal";
import { toast } from "react-toastify";
import { CreateAuthorSchema } from "../schema";
import { ModalProps, Author } from "@definitions/types";
import { ADD_AUTHOR_INITIAL_FORM } from "./AuthorPage";
import { useRequest } from "@hooks/useRequest";
import { apiScope } from "@definitions/configs/msal/scopes";

const AddAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { form, errors, validate, handleFormInput, resetForm } = useForm<
    Omit<Author, "id">
  >({
    initialFormData: ADD_AUTHOR_INITIAL_FORM,
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
  const { Post } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Post("/authors/", form, {}, [apiScope("Author.Add")]),
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

  // if (!isOpen) return null; //; temporary fix for react-responsive-modal bug

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      showCloseIcon={false}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-44">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">New Author</h1>
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Person's name or organization's name"
              error={errors?.name}
              type="text"
              name="name"
              onChange={handleFormInput}
              value={form.name}
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Submit</PrimaryButton>
            <LighButton type="button" onClick={closeModal}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddAuthorModal;
