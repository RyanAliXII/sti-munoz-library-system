import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import { Input, InputClasses } from "@components/ui/form/Input";
import { Book, ModalProps } from "@definitions/types";
import { format } from "date-fns";
import React, { useState } from "react";
import Modal from "react-responsive-modal";

interface DueDateInputModelProps extends ModalProps {
  onConfirmDate: ({}: { date: string; isEbook: boolean }) => void;
  book?: Book;
}
export const DueDateInputModal: React.FC<DueDateInputModelProps> = ({
  isOpen,
  closeModal,
  onConfirmDate,
  book,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      focusTrapped={false}
      open={isOpen}
      onClose={closeModal}
      center
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      containerId="dueDateInputOverlay"
      modalId="dueDateInputModal"
    >
      <form>
        <div className="w-full  mt-2">
          <div className="px-2 mb-4">
            <h1 className="text-xl font-medium">Approve Request</h1>
          </div>
          <div className=" mb-3">
            <div>
              <Input
                type="date"
                label="Due date"
                min={format(new Date(), "Y-M-dd")}
              />
            </div>
            <div>
              <label className={InputClasses.LabelClasslist}>Book type</label>
              <select
                className={InputClasses.InputDefaultClasslist}
                disabled={(book?.ebook ?? "").length === 0}
              >
                <option value="false">Hardcopy</option>
                <option value="true">Ebook</option>
              </select>
            </div>
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton
              type="button"
              onClick={() => {
                // onConfirmDate(dueDate);
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
