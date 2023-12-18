import { CustomInput } from "@components/ui/form/Input";
import { Author, ModalProps } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import React, { BaseSyntheticEvent, useEffect } from "react";
import { toast } from "react-toastify";
import { CreateAuthorSchema } from "../schema";
import { EDIT_AUTHOR_INITIAL_FORM } from "./AuthorPage";
import { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";
import useModalToggleListener from "@hooks/useModalToggleListener";

interface EditModalProps<T> extends ModalProps {
  formData: T;
}
const EditAuthorPersonModal: React.FC<EditModalProps<Author>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const {
    form,
    errors,
    removeErrors,
    setForm,
    resetForm,
    validate,
    handleFormInput,
    setErrors,
  } = useForm<Author>({
    initialFormData: EDIT_AUTHOR_INITIAL_FORM,
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
  const { Put } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Put(`/authors/${formData.id}/`, form, {}),
    onSuccess: () => {
      toast.success("Author has been updated.");
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
      <Modal.Header>Edit Author</Modal.Header>
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
export default EditAuthorPersonModal;
