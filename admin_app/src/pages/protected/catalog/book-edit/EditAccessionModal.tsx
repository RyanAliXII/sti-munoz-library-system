import { CustomInput } from "@components/ui/form/Input";
import { Accession, EditModalProps, ModalProps } from "@definitions/types";
import { useEditAccession } from "@hooks/data-fetching/accession";
import { useForm } from "@hooks/useForm";
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
  const { form, setForm, handleFormInput, validate } = useForm<Accession>({
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
    setForm(formData);
  }, [formData]);

  const editAccession = useEditAccession({
    onSuccess: () => {
      toast.success("Accession updated.");
      closeModal();
    },
    onError: () => {},
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
          <CustomInput
            type="number"
            label="Accession number"
            value={form.number}
            onChange={handleFormInput}
            name="number"
          />
          <Button type="submit" color="primary">
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
