import { ModalProps, Publisher } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseSyntheticEvent } from "react";
import { toast } from "react-toastify";
import { PublisherSchema } from "../schema";
import Modal from "react-responsive-modal";
import { Input } from "@components/ui/form/Input";
import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import { apiScope } from "@definitions/configs/msal/scopes";
const PUBLISHER_FORM_DEFAULT_VALUES = { name: "" };
const AddPublisherModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { errors, form, validate, handleFormInput, resetForm } =
    useForm<Publisher>({
      initialFormData: PUBLISHER_FORM_DEFAULT_VALUES,
      schema: PublisherSchema,
    });
  const { Post } = useRequest();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      Post("/publishers/", form, {}, [apiScope("Publisher.Add")]),
    onSuccess: () => {
      toast.success("New publisher has been added.");
      queryClient.invalidateQueries(["publishers"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      resetForm();
      closeModal();
    },
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
  if (!isOpen) return null;
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-46 mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">New Publisher</h1>
          </div>
          <div className="px-2">
            <Input
              label="Publisher name"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Add publisher</PrimaryButton>
            <LighButton onClick={closeModal} type="button">
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};
export default AddPublisherModal;
