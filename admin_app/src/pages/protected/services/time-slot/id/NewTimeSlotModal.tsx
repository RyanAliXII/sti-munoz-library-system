import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import { ModalProps } from "@definitions/types";
import { useNewTimeSlot } from "@hooks/data-fetching/time-slot";
import { useForm } from "@hooks/useForm";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

type TimeSlotForm = {
  startTime: Date;
  endTime: Date;
};
const NewTimeSlotModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const { id } = useParams();
  const { form, setForm } = useForm<TimeSlotForm>({
    initialFormData: {
      endTime: new Date(),
      startTime: new Date(),
    },
  });
  const newSlot = useNewTimeSlot({
    onSuccess: () => {
      toast.success("New time slot has been created.");
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const startTime = form.startTime.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const endTime = form.endTime.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      newSlot.mutate({
        startTime,
        endTime,
        profileId: id ?? "",
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Modal dismissible show={isOpen} onClose={closeModal} size="lg">
      <Modal.Header>New Slot</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <CustomDatePicker
              selected={form.startTime}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              onChange={(date) => {
                if (!date) return;
                setForm((prev) => ({ ...prev, startTime: date }));
              }}
              label="Start time"
              dateFormat="h:mm aa"
            />
          </div>
          <div className="py-2">
            <CustomDatePicker
              selected={form.endTime}
              showTimeSelect
              timeIntervals={30}
              showTimeSelectOnly
              onChange={(date) => {
                if (!date) return;
                setForm((prev) => ({ ...prev, endTime: date }));
              }}
              label="End time"
              dateFormat="h:mm aa"
            />
          </div>
          <Button color="primary" type="submit">
            <div className="flex gap-2 items-center">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default NewTimeSlotModal;
