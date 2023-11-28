import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import { EditModalProps, ModalProps, TimeSlot } from "@definitions/types";
import {
  useEditTimeSlot,
  useNewTimeSlot,
} from "@hooks/data-fetching/time-slot";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useQueryClient } from "@tanstack/react-query";
import { error } from "console";
import { Button, Modal } from "flowbite-react";
import { format } from "path";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { date } from "yup";

type TimeSlotForm = {
  startTime: Date;
  endTime: Date;
};
const EditTimeSlotModal: FC<EditModalProps<TimeSlot>> = ({
  closeModal,
  isOpen,
  formData,
}) => {
  const { id } = useParams();
  const {
    form,
    setForm,
    setErrors,
    errors,
    resetForm,
    removeErrors,
    removeFieldError,
  } = useForm<TimeSlotForm>({
    initialFormData: {
      endTime: new Date(),
      startTime: new Date(),
    },
  });
  const queryClient = useQueryClient();
  const updateSlot = useEditTimeSlot({
    onSuccess: () => {
      toast.success("Time slot has been updated.");
      closeModal();
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      if (error.response?.status === 400) {
        const { data } = error.response.data;
        if (data?.errors) {
          setErrors(data?.errors);
          return;
        }
      }
      toast.error("Unknown error occured.");
    },
  });

  const formatTime = (time: string) => {
    try {
      const dateString = "1970-01-01 " + time;
      const date = new Date(dateString);
      return date;
    } catch (error) {
      console.error(error);
      return new Date();
    }
  };
  useModalToggleListener(isOpen, () => {
    if (!isOpen) {
      resetForm();
      removeErrors();
      return;
    }
    setForm(() => ({
      endTime: formatTime(formData.endTime),
      startTime: formatTime(formData.startTime),
    }));
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
      updateSlot.mutate({
        id: formData.id,
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
      <Modal.Header>Edit Slot</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <CustomDatePicker
              selected={form.startTime}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              error={errors?.startTime}
              onChange={(date) => {
                if (!date) return;
                removeFieldError("startTime");
                setForm((prev) => ({ ...prev, startTime: date }));
              }}
              label="Start time"
              dateFormat="h:mm aa"
            />
          </div>
          <div className="py-3">
            <CustomDatePicker
              selected={form.endTime}
              showTimeSelect
              timeIntervals={30}
              showTimeSelectOnly
              error={errors?.endTime}
              onChange={(date) => {
                if (!date) return;
                removeFieldError("endTime");
                setForm((prev) => ({ ...prev, endTime: date }));
              }}
              label="End time"
              dateFormat="h:mm aa"
            />
          </div>
          <Button
            color="primary"
            type="submit"
            isProcessing={updateSlot.isLoading}
          >
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

export default EditTimeSlotModal;
