import { ModalProps, Publisher } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseSyntheticEvent, useEffect } from "react";
import { toast } from "react-toastify";
import { PublisherSchema } from "../schema";

import { CustomInput } from "@components/ui/form/Input";

import { Button, Modal } from "flowbite-react";
import { useBookAddFormContext } from "./BookAddFormContext";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";

const PUBLISHER_FORM_DEFAULT_VALUES = { name: "" };

const AddPublisherModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { setFieldValue } = useBookAddFormContext();
  const { errors, form, validate, handleFormInput, setErrors, resetForm } =
    useForm<Publisher>({
      initialFormData: PUBLISHER_FORM_DEFAULT_VALUES,
      schema: PublisherSchema,
    });
  const { Post } = useRequest();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => Post("/publishers/", form, {}),
    onSuccess: (response) => {
      toast.success("New publisher has been added.");
      queryClient.invalidateQueries(["publishers"]);
      const { data } = response.data;
      if (data?.publisher?.name && data?.publisher?.id) {
        setFieldValue("publisher", data?.publisher);
      }
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
    }
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

  return (
    <Modal onClose={closeModal} show={isOpen} size={"lg"} dismissible>
      <Modal.Header>
        <div>
          <h1 className="text-xl font-medium">New Publisher</h1>
        </div>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={submit}>
          <div className="w-full h-46 ">
            <div>
              <CustomInput
                label="Publisher name"
                error={errors?.name}
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormInput}
              />
            </div>
            <div className="flex gap-1 mt-3">
              <Button
                color="primary"
                type="submit"
                isProcessing={mutation.isLoading}
                disabled={mutation.isLoading}
              >
                Add publisher
              </Button>
              <Button color="light" onClick={closeModal} type="button">
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};
export default AddPublisherModal;
