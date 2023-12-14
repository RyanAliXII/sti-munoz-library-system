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
import { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";

const EditSectionModal: React.FC<EditModalProps<Section>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const FORM_DEFAULT_VALUES: Omit<Section, "isDeleteable" | "accessionTable"> =
    {
      name: "",
      prefix: "",
      isSubCollection: false,
      mainCollectionId: 0,
      lastValue: 0,
    };
  const {
    form,
    errors,
    handleFormInput,
    validate,
    resetForm,
    setForm,
    setErrors,
    removeErrors,
  } = useForm<Omit<Section, "isDeleteable" | "accessionTable">>({
    initialFormData: FORM_DEFAULT_VALUES,
    schema: EditSectionSchema,
  });

  const queryClient = useQueryClient();
  const { Put } = useRequest();
  const mutation = useMutation({
    mutationFn: (
      formValues: Omit<Section, "isDeleteable" | "accessionTable">
    ) => Put(`/sections/${formValues.id}`, formValues, {}),
    onSuccess: () => {
      toast.success("Section updated.");
      queryClient.invalidateQueries(["sections"]);
      resetForm();
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
      const parsedForm = await validate();
      if (!parsedForm) return;
      mutation.mutate(parsedForm);
    } catch (error) {
      console.error(error);
    }
  };
  useModalToggleListener(isOpen, () => {
    if (!isOpen) {
      resetForm();
      removeErrors();
      return;
    }
    setForm(formData);
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>Edit Collection</Modal.Header>
      <Modal.Body>
        <form onSubmit={submit}>
          <div className="w-full py-1">
            <CustomInput
              label="Collection name"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="w-full py-1">
            <CustomInput
              label="Collection Prefix"
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
