import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import { TextAreaClasses } from "@components/ui/form/Input";
import { BorrowedBook, ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Label, Modal, Textarea } from "flowbite-react";

import React, { FormEvent, useEffect } from "react";
import { FaSave } from "react-icons/fa";

interface RemarksModalProps extends ModalProps {
  onConfirm: ({}: { remarks: string }) => void;
  borrowedBook?: BorrowedBook;
}
export const EditRemarksModal: React.FC<RemarksModalProps> = ({
  isOpen,
  closeModal,
  onConfirm,
  borrowedBook,
}) => {
  const { handleFormInput, form, setForm } = useForm<{
    remarks: string;
  }>({
    initialFormData: {
      remarks: "",
    },
  });
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    onConfirm(form);
  };
  useEffect(() => {
    if (!borrowedBook) return;
    setForm({ remarks: borrowedBook.remarks });
  }, [borrowedBook]);
  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={closeModal} size="lg" dismissible>
      <Modal.Header>Edit Remarks</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="w-full ">
            <div className="mb-3">
              <div>
                <Label>Remarks</Label>
                <Textarea
                  value={form.remarks}
                  name="remarks"
                  onChange={handleFormInput}
                  className={TextAreaClasses.DefaultClasslist}
                />
              </div>
            </div>
            <div className="flex gap-1">
              <Button color="primary" type="submit">
                <div className="flex gap-1 items-center">
                  <FaSave />
                  Save
                </div>
              </Button>
              <Button color="gray" onClick={closeModal} type="button">
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditRemarksModal;
