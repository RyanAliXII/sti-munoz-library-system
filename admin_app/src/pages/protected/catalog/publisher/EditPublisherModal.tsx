import { ModalProps, Publisher } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { PublisherSchema } from "../schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseSyntheticEvent, useEffect } from "react";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { Button, Modal } from "flowbite-react";
import { CustomInput } from "@components/ui/form/Input";

interface EditModalProps<T> extends ModalProps {
  formData: T;
}
const PUBLISHER_FORM_DEFAULT_VALUES = { name: "" };
const EditPublisherModal: React.FC<EditModalProps<Publisher>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const { errors, form, setForm, validate, handleFormInput } =
    useForm<Publisher>({
      initialFormData: PUBLISHER_FORM_DEFAULT_VALUES,
      schema: PublisherSchema,
    });

  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);

  const queryClient = useQueryClient();
  const { Put } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Put(`/publishers/${formData.id}/`, form),
    onSuccess: () => {
      toast.success("Publisher has been updated.");
      queryClient.invalidateQueries(["publishers"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.Update);
      console.error(error);
    },
    onSettled: () => {
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
              <Button color="primary" type="submit">
                Save
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

export default EditPublisherModal;
