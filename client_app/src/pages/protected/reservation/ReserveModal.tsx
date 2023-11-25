import CustomSelect from "@components/ui/form/CustomSelect";
import { DateSlot, Device, ModalProps, TimeSlot } from "@definitions/types";
import {
  ReserveForm,
  useNewReservation,
} from "@hooks/data-fetching/reservation";
import { useTimeSlotsBasedOnDateAndDevice } from "@hooks/data-fetching/time-slot";
import { useForm } from "@hooks/useForm";
import { useQueryClient } from "@tanstack/react-query";
import { FC, FormEvent, useEffect } from "react";
import Modal from "react-responsive-modal";
import { SingleValue } from "react-select";
import { toast } from "react-toastify";
import { ReservationValidation } from "./schema";
import { get12HRTimeFromDate } from "@helpers/datetime";
interface ReserveModalProps extends ModalProps {
  devices: Device[];
  timeSlots: TimeSlot[];
  dateSlot: DateSlot;
}
const ReserveModal: FC<ReserveModalProps> = ({
  closeModal,
  isOpen,
  devices,

  dateSlot,
}) => {
  const queryClient = useQueryClient();

  const newReservation = useNewReservation({
    onSuccess: () => {
      toast.success("Reservation has been successful.");
      queryClient.invalidateQueries(["reservations"]);
      closeModal();
      resetForm();
    },
    onError: (error) => {
      toast.error("Unknown error occured.");
      console.error(error);
    },
  });
  const {
    removeErrors,
    removeFieldError,
    resetForm,
    setForm,
    form,
    errors,
    validate,
  } = useForm<ReserveForm>({
    initialFormData: {
      deviceId: "",
      dateSlotId: "",
      timeSlotId: "",
    },
    schema: ReservationValidation,
  });
  const { data: timeSlots } = useTimeSlotsBasedOnDateAndDevice({
    queryKey: ["timeSlots", dateSlot.profileId, dateSlot.id, form.deviceId],
  });
  const handleDeviceSelection = (device: SingleValue<Device>) => {
    if (!device) return;
    removeFieldError("deviceId");
    setForm((prev) => ({ ...prev, deviceId: device?.id }));
  };
  const handleTimeSlotSelection = (timeSlot: SingleValue<TimeSlot>) => {
    if (!timeSlot) return;
    removeFieldError("timeSlotId");
    setForm((prev) => ({ ...prev, timeSlotId: timeSlot.id }));
  };
  useEffect(() => {
    setForm((prev) => ({ ...prev, dateSlotId: dateSlot.id }));
  }, [dateSlot]);
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      removeErrors();
      event.preventDefault();
      const reservation = await validate();
      if (!reservation) return;

      newReservation.mutate(reservation);
    } catch (error) {
      console.error(error);
    }
  };
  if (!isOpen) return null;
  return (
    <Modal
      onClose={closeModal}
      open={isOpen}
      center
      styles={{
        modal: {
          overflowY: "visible",
          maxWidth: "450px",
        },
      }}
      closeOnOverlayClick={true}
      classNames={{
        modal: "w-11/12 md:w-7/12 lg:w-3/12 rounded h-62",
      }}
    >
      <div>
        <div className="py-3">
          <h1 className="text-lg font-semibold">Select Device and Time</h1>
        </div>
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <CustomSelect
              error={errors?.deviceId}
              label="Device"
              onChange={handleDeviceSelection}
              options={devices}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
            />
          </div>
          <div className="pb-2">
            <CustomSelect
              label="Time"
              error={errors?.timeSlotId}
              options={timeSlots}
              getOptionLabel={(option) =>
                `${get12HRTimeFromDate(
                  option.startTime
                )} - ${get12HRTimeFromDate(option.endTime)}`.toString()
              }
              getOptionValue={(option) => option.id}
              onChange={handleTimeSlotSelection}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Submit
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default ReserveModal;
