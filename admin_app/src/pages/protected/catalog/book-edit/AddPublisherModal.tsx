import { CustomInput } from "@components/ui/form/Input";
import { ModalProps, Publisher } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button, Modal } from "flowbite-react";
import { StatusCodes } from "http-status-codes";
import { BaseSyntheticEvent } from "react";
import { toast } from "react-toastify";
import { PublisherSchema } from "../schema";
import { useBookEditFormContext } from "./BookEditFormContext";
const PUBLISHER_FORM_DEFAULT_VALUES = { name: "" };
const AddPublisherModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { errors, form, validate, handleFormInput, resetForm, setErrors } =
    useForm<Publisher>({
      initialFormData: PUBLISHER_FORM_DEFAULT_VALUES,
      schema: PublisherSchema,
    });
  const { setForm: setBookEditForm } = useBookEditFormContext();
  const { Post } = useRequest();
  const queryClient = useQueryClient();
  const addPublisher = useMutation({
    mutationFn: () => Post("/publishers/", form, {}),
    onSuccess: (response) => {
      toast.success("New publisher has been added.");
      queryClient.invalidateQueries(["publishers"]);
      const { data } = response.data;
      if (data?.publisher?.id) {
        setBookEditForm((prev) => ({ ...prev, publisher: data.publisher }));
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

  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      await validate();
      addPublisher.mutate();
    } catch (error) {
      console.error(error);
    }
  };
  useModalToggleListener(isOpen, () => {
    if (!isOpen) {
      resetForm();
    }
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible={true} size={"lg"}>
      <Modal.Header>New Publisher</Modal.Header>
      <Modal.Body>
        <form onSubmit={submit}>
          <CustomInput
            label="Publisher name"
            error={errors?.name}
            type="text"
            name="name"
            value={form.name}
            onChange={handleFormInput}
          />

          <div className="flex gap-1 py-3">
            <Button color="primary" type="submit">
              Add publisher
            </Button>
            <Button color="light" onClick={closeModal} type="button">
              Cancel
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};
export default AddPublisherModal;
