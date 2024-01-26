import { CustomInput } from "@components/ui/form/Input";
import { Accession, EditModalProps } from "@definitions/types";
import { useEditAccession } from "@hooks/data-fetching/accession";
import { useForm } from "@hooks/useForm";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent, useEffect } from "react";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { number, object } from "yup";

const EditAccessionModal: FC<EditModalProps<Accession>> = ({
  closeModal,
  isOpen,
  formData,
}) => {
  const { form, setForm, handleFormInput, validate, errors, setErrors } =
    useForm<Accession>({
      initialFormData: {
        copyNumber: 0,
        isAvailable: false,
        isMissing: false,
        isWeeded: false,
        number: 0,
        remarks: "",
        id: "",
      },
      schema: object({
        number: number()
          .integer("Accession number cannot be decimal.")
          .required("Invalid accession number")
          .min(0, "Accession should not be less than 0")
          .typeError("Invalid accession number"),
      }),
    });
  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);
  const queryClient = useQueryClient();
  const editAccession = useEditAccession({
    onSuccess: () => {
      toast.success("Accession updated.");
      closeModal();
      queryClient.invalidateQueries(["bookAccessions"]);
    },
    onError: (error) => {
      const { data } = error.response?.data;
      if (data?.errors) {
        setErrors(data?.errors);
        return;
      }
    },
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const validatedForm = await validate();
      if (!validatedForm) return;
      editAccession.mutate(validatedForm);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <Modal show={isOpen} onClose={closeModal} size={"lg"} dismissible={true}>
      <Modal.Header>Edit Accession</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <CustomInput
              type="number"
              error={errors?.number}
              label="Accession number"
              value={form.number}
              onChange={handleFormInput}
              name="number"
            />
          </div>
          <Button
            type="submit"
            color="primary"
            isProcessing={editAccession.isLoading}
          >
            <div className="flex items-center gap-1">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditAccessionModal;
