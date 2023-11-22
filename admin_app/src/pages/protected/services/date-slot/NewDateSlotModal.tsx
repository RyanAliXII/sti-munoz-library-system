import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import { ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { format } from "date-fns";
import { Button, Modal } from "flowbite-react";
import { FC } from "react";
import { FaSave } from "react-icons/fa";

type DateSlotForm = {
  from: string;
  to: string;
};
const NewDateSlotModal: FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { removeFieldError, setForm, form } = useForm<DateSlotForm>({
    initialFormData: {
      from: format(new Date(), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    },
  });
  const handleFromInput = (date: Date) => {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    removeFieldError("from");
    setForm((prev) => ({ ...prev, from: dateStr }));
  };
  const handleToInput = (date: Date) => {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    removeFieldError("to7");
    setForm((prev) => ({ ...prev, to: dateStr }));
  };
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>New Slots</Modal.Header>
      <Modal.Body>
        <form>
          <div className="py-2">
            <CustomDatePicker
              selected={new Date(form.from)}
              minDate={new Date()}
              label="From"
              onChange={handleFromInput}
            />
          </div>
          <div className="py-2">
            <CustomDatePicker
              selected={new Date(form.to)}
              minDate={new Date()}
              label="To"
              onChange={handleToInput}
            />
          </div>
          <Button color="primary">
            <div className="flex items-center gap-2">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default NewDateSlotModal;
