import { CustomInput } from "@components/ui/form/Input";
import { Accession, EditModalProps, ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { Button, Modal } from "flowbite-react";
import { FC, useEffect } from "react";
import { FaSave } from "react-icons/fa";

const EditAccessionModal: FC<EditModalProps<Accession>> = ({
  closeModal,
  isOpen,
  formData,
}) => {
  const { form, setForm, handleFormInput } = useForm<Accession>({
    initialFormData: {
      copyNumber: 0,
      isAvailable: false,
      isMissing: false,
      isWeeded: false,
      number: 0,
      remarks: "",
      id: "",
    },
  });
  useEffect(() => {
    setForm(formData);
  }, [formData]);
  return (
    <Modal show={isOpen} onClose={closeModal} size={"lg"} dismissible={true}>
      <Modal.Header>Edit Accession</Modal.Header>
      <Modal.Body>
        <form>
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
