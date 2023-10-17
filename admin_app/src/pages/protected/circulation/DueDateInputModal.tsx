import { LighButton, PrimaryButton } from "@components/ui/button/Button";

import { Input, InputClasses } from "@components/ui/form/Input";
import { Book, ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";

import { format, isMatch, isBefore, isEqual } from "date-fns";

import React, { FormEvent } from "react";
import Modal from "react-responsive-modal";
import { boolean, object, string } from "yup";

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
  const { handleFormInput, form, validate, errors } = useForm<{
    date: string;
    isEbook: boolean;
  }>({
    initialFormData: {
      date: "",
      isEbook: false,
    },
    schema: object({
      date: string()
        .required("Due date is required.")
        .test(
          "test-is-after-date",
          "Date must not be less than the date today.",
          (value) => {
            if (!value) return false;
            try {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const selectedDate = new Date(value);
              selectedDate.setHours(0, 0, 0, 0);
              return !isBefore(selectedDate, now) || isEqual(now, selectedDate);
            } catch {
              return false;
            }
          }
        )
        .test("match-format", "Date is required.", (value) => {
          if (!value) return false;
          return isMatch(value, "yyyy-MM-dd");
        }),
      isEbook: boolean().typeError("This is required field"),
    }),
  });
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await validate();
      if (!result) return;
      onConfirmDate({ date: form.date, isEbook: false });
    } catch {}
  };
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
            <h1 className="text-xl font-medium">Approve Request</h1>
          </div>
          <div className="mb-3">
            <div>
              <Input
                type="date"
                name="date"
                onChange={handleFormInput}
                label="Due date"
                error={errors?.date}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div>
              <label className={InputClasses.LabelClasslist}>Book type</label>
              <select
                name="isEbook"
                onChange={handleFormInput}
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
