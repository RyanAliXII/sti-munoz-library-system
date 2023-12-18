import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import { BorrowedBook, ModalProps, Settings } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { format, isBefore, isEqual, isMatch } from "date-fns";
import { Button, Modal } from "flowbite-react";
import React, { FormEvent, useEffect } from "react";
import { object, string } from "yup";

interface DueDateInputModelProps extends ModalProps {
  onConfirmDate: ({}: { date: string }) => void;
  borrowedBook?: BorrowedBook;
}
export const EditDueDateModal: React.FC<DueDateInputModelProps> = ({
  isOpen,
  closeModal,
  onConfirmDate,
  borrowedBook,
}) => {
  const { validate, errors, form, setForm, removeFieldError } = useForm<{
    date: string;
  }>({
    initialFormData: {
      date: format(new Date(), "yyyy-MM-dd"),
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
    }),
  });
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await validate();
      if (!result) return;
      onConfirmDate(result);
    } catch {}
  };

  useEffect(() => {
    if (!borrowedBook) return;
    setForm({ date: borrowedBook.dueDate });
  }, [borrowedBook]);
  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>Edit due date</Modal.Header>
      <Modal.Body className="small-scroll">
        <form onSubmit={onSubmit}>
          <div>
            <CustomDatePicker
              label="Due date"
              error={errors?.date}
              selected={new Date(form.date)}
              minDate={new Date()}
              onChange={(date) => {
                if (!date) return;
                removeFieldError("date");
                setForm({
                  date: format(date, "yyyy-MM-dd"),
                });
              }}
            />

            <div className="flex gap-1 py-2">
              <Button color="primary" type="submit">
                Save
              </Button>
              <Button color="light" onClick={closeModal} type="button">
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditDueDateModal;
