import { CustomInput } from "@components/ui/form/Input";
import { EditModalProps, Section } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { BaseSyntheticEvent } from "react";
import { toast } from "react-toastify";
import { EditSectionSchema } from "../schema";

const EditSectionModal: React.FC<EditModalProps<Section>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const FORM_DEFAULT_VALUES: Section = {
    name: "",
    prefix: "",
    hasOwnAccession: false,
    lastValue: 0,
  };
  const { form, errors, handleFormInput, validate, resetForm, setForm } =
    useForm<Section>({
      initialFormData: FORM_DEFAULT_VALUES,
      schema: EditSectionSchema,
    });

  const queryClient = useQueryClient();
  const { Put } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Put(`/sections/${form.id}`, form, {}),
    onSuccess: () => {
      toast.success("Section updated.");
      queryClient.invalidateQueries(["sections"]);
      resetForm();
    },
    onError: (error) => {
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
  useModalToggleListener(isOpen, () => {
    if (!isOpen) {
      resetForm();
      return;
    }
    setForm(formData);
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>Edit Section</Modal.Header>
      <Modal.Body>
        <form onSubmit={submit}>
          <div className="w-full py-1">
            <CustomInput
              label="Section name"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="w-full py-1">
            <CustomInput
              label="Section Prefix"
              error={errors?.prefix}
              type="text"
              name="prefix"
              value={form.prefix}
              onChange={handleFormInput}
            />
          </div>
          <div className="w-full py-1">
            <CustomInput
              label="Accession counter"
              error={errors?.lastValue}
              type="number"
              name="lastValue"
              value={form.lastValue}
              onChange={handleFormInput}
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              color="primary"
              type="submit"
              isProcessing={mutation.isLoading}
            >
              Save
            </Button>
            <Button color="light" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditSectionModal;
