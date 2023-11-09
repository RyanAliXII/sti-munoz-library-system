import { LighButton, PrimaryButton } from "@components/ui/button/Button";

import { TextAreaClasses } from "@components/ui/form/Input";
import { BorrowedBook, ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";

import React, { FormEvent, useEffect } from "react";
import Modal from "react-responsive-modal";

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
    <Modal
      focusTrapped={false}
      open={isOpen}
      onClose={closeModal}
      center
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-5/12 lg:w-5/12 xl:w-3/12 rounded" }}
      containerId="dueDateInputOverlay"
      modalId="dueDateInputModal"
    >
      <form onSubmit={onSubmit}>
        <div className="w-full  mt-2">
          <div className="px-2 mb-4">
            <h1 className="text-xl font-medium">Edit Remarks</h1>
          </div>
          <div className="mb-3">
            <div>
              <label>Remarks</label>
              <textarea
                value={form.remarks}
                name="remarks"
                onChange={handleFormInput}
                className={TextAreaClasses.DefaultClasslist}
              ></textarea>
            </div>
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Save</PrimaryButton>
            <LighButton onClick={closeModal} type="button">
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditRemarksModal;
