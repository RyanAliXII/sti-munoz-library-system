import { CustomInput } from "@components/ui/form/Input";
import { Audit, ModalProps } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { BaseSyntheticEvent, useEffect } from "react";
import { toast } from "react-toastify";
import { AuditSchemaValidation } from "../catalog/schema";

interface EditModalProps<T> extends ModalProps {
  formData: T;
}
const EditAuditModal: React.FC<EditModalProps<Audit>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const { form, errors, validate, handleFormInput, resetForm, setForm } =
    useForm<Audit>({
      initialFormData: {
        name: "",
      },
      schema: AuditSchemaValidation,
    });

  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);
  const queryClient = useQueryClient();
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      let parsedForm = await validate();
      if (!parsedForm) return;
      updateAudit.mutate(parsedForm);
    } catch (error) {
      console.error(error);
    }
  };
  const { Put } = useRequest();
  const updateAudit = useMutation({
    mutationFn: (parsedForm: Audit) =>
      Put(`/inventory/audits/${parsedForm.id}`, parsedForm),
    onSuccess: () => {
      toast.success("Audit has been updated.");
      queryClient.invalidateQueries(["audits"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      closeModal();
    },
  });

  useModalToggleListener(isOpen, () => {
    if (!isOpen) resetForm();
  });
  return (
    <Modal show={isOpen} onClose={closeModal} size="lg" dismissible>
      <Modal.Header>New Audit</Modal.Header>
      <Modal.Body>
        <form onSubmit={submit}>
          <div className="w-full ">
            <div>
              <CustomInput
                label="Name"
                error={errors?.name}
                type="text"
                name="name"
                onChange={handleFormInput}
                value={form.name}
              />
            </div>
            <div className="flex gap-1 py-2">
              <Button
                color="primary"
                isProcessing={updateAudit.isLoading}
                type="submit"
              >
                Save
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

export default EditAuditModal;
