import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import { Input } from "@components/ui/form/Input";
import { ModalProps } from "@definitions/types";
import React, { useState } from "react";
import Modal from "react-responsive-modal";

interface DueDateInputModelProps extends ModalProps {
  onConfirmDate: (date: string) => void;
}
export const DueDateInputModal: React.FC<DueDateInputModelProps> = ({
  isOpen,
  closeModal,
  onConfirmDate,
}) => {
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString());
  if (!isOpen) return null;
  return (
    <Modal
      focusTrapped={false}
      open={isOpen}
      onClose={closeModal}
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      center
      modalId="dueDateInputModal"
    >
      <form>
        <div className="w-full  mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">Set Due Date</h1>
          </div>
          <div className="px-2">
            <div>
              <CustomDatePicker
                popperProps={{ strategy: "fixed" }}
                name="dueDate"
                placeholderText="Select due date"
                // minDate={new Date()}
                value={new Date(dueDate).toLocaleDateString()}
                onChange={(date) => {
                  if (!date) return;
                  setDueDate(date.toISOString());
                }}
              />
            </div>
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton
              type="button"
              onClick={() => {
                onConfirmDate(dueDate);
              }}
            >
              Save
            </PrimaryButton>
            <LighButton onClick={closeModal} type="button">
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default DueDateInputModal;
