import { ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { Button, Modal, Textarea } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";

interface EditRemarksModalProps extends ModalProps {
  remarks: string;
  onProceed?: (remarks: string) => void;
}
const EditRemarksModal: FC<EditRemarksModalProps> = ({
  closeModal,
  isOpen,
  remarks,
  onProceed,
}) => {
  const { form, handleFormInput, setForm } = useForm({
    initialFormData: {
      remarks: "",
    },
  });
  useModalToggleListener(isOpen, () => {
    if (!isOpen) return;
    setForm({ remarks: remarks });
  });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onProceed?.(form.remarks);
  };
  return (
    <Modal onClose={closeModal} show={isOpen} dismissible size="lg">
      <Modal.Header>Edit Remarks</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <Textarea
              value={form.remarks}
              name="remarks"
              onChange={handleFormInput}
              className="resize-none"
            />
          </div>
          <Button color="primary" type="submit">
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
export default EditRemarksModal;
