import { CustomInput } from "@components/ui/form/Input";
import { Audit, ModalProps } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { BaseSyntheticEvent } from "react";
import { toast } from "react-toastify";
import { AuditSchemaValidation } from "../catalog/schema";

type NewAuditForm = Omit<Audit, "id">;
const NewAuditModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { form, errors, validate, handleFormInput, resetForm } =
    useForm<NewAuditForm>({
      initialFormData: {
        name: "",
      },
      schema: AuditSchemaValidation,
    });
  const queryClient = useQueryClient();
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      let parsedForm = await validate();
      if (!parsedForm) return;
      newAudit.mutate(parsedForm);
    } catch (error) {
      console.error(error);
    }
  };
  const { Post } = useRequest();
  const newAudit = useMutation({
    mutationFn: (parsedForm: NewAuditForm) =>
      Post("/inventory/audits", parsedForm, {}),
    onSuccess: () => {
      toast.success("New audit has been added.");
      queryClient.invalidateQueries(["audits"]);
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
                isProcessing={newAudit.isLoading}
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

export default NewAuditModal;
