import { CustomInput } from "@components/ui/form/Input";
import { Author, ModalProps } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { BaseSyntheticEvent } from "react";
import { toast } from "react-toastify";
import { CreateAuthorSchema } from "../schema";
import { ADD_AUTHOR_INITIAL_FORM } from "./AuthorPage";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";

const AddAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const {
    form,
    errors,
    validate,
    handleFormInput,
    resetForm,
    setErrors,
    removeErrors,
  } = useForm<Omit<Author, "id">>({
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
    mutationFn: () => Post("/authors/", form, {}),
    onSuccess: () => {
      toast.success("New author has been added.");
      queryClient.invalidateQueries(["authors"]);
      closeModal();
    },
    onError: (error: AxiosError<any, any>) => {
      const status = error.response?.status;
      const { data } = error.response?.data;
      if (status === StatusCodes.BAD_REQUEST) {
        if (data?.errors) {
          setErrors(data?.errors);
          return;
        }
      }
    },
  });
  useModalToggleListener(isOpen, () => {
    if (!isOpen) {
      resetForm();
      removeErrors();
      return;
    }
  });
  return (
    <Modal show={isOpen} onClose={closeModal} size="lg" dismissible>
      <Modal.Header>New Author</Modal.Header>
      <Modal.Body>
        <form onSubmit={submit}>
          <div className="w-full ">
            <div>
              <CustomInput
                label="Person's name or organization's name"
                error={errors?.name}
                type="text"
                name="name"
                onChange={handleFormInput}
                value={form.name}
              />
            </div>
            <div className="flex gap-1  py-3">
              <Button color="primary" type="submit">
                Submit
              </Button>
              <Button color="light" type="button" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddAuthorModal;
