import CustomSelect from "@components/ui/form/CustomSelect";
import {
  DateSlot,
  Device,
  ModalProps,
  Reservation,
  TimeSlot,
} from "@definitions/types";
import { to12HR } from "@helpers/datetime";
import { useDevice } from "@hooks/data-fetching/device";
import {
  ReserveForm,
  useNewReservation,
} from "@hooks/data-fetching/reservation";
import { useTimeSlotsBasedOnDateAndDevice } from "@hooks/data-fetching/time-slot";
import { useForm } from "@hooks/useForm";
import { useQueryClient } from "@tanstack/react-query";
import { FC, FormEvent, useEffect, useMemo } from "react";
import Modal from "react-responsive-modal";
import { SingleValue } from "react-select";
import { toast } from "react-toastify";
import { ReservationValidation } from "./schema";
import { useAccountStats } from "@hooks/data-fetching/account";
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
  const { data: accountStats } = useAccountStats();

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

  const { data: device, isFetching: isFetchingDevice } = useDevice({
    queryKey: ["device", form.deviceId],
  });
  const { data: dateAndDevice, isFetching: isFetchingTimeSlots } =
    useTimeSlotsBasedOnDateAndDevice({
      queryKey: ["timeSlots", dateSlot.profileId, dateSlot.id, form.deviceId],
    });
  const currentDateReservations = useMemo(
    () =>
      dateAndDevice?.reservations?.reduce((a, reservation) => {
        a.set(reservation.timeSlotId, reservation);
        return a;
      }, new Map<string, Reservation>()),
    [dateAndDevice]
  );
  const selectedDeviceCurrentReservationCount = useMemo(() => {
    return (
      dateAndDevice?.reservations?.filter((r) => r.deviceId === form.deviceId)
        .length ?? 0
    );
  }, [dateAndDevice]);

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
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      removeErrors();
    }
  }, [isOpen]);
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

        {selectedDeviceCurrentReservationCount >=
          (accountStats?.maxUniqueDeviceReservationPerDay ?? 0) && (
          <div className="px-2">
            <div className="alert alert-warning shadow-lg mt-5 text-sm">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  You have reached the maximum number of reservations allowed
                  for this device on this date.
                </span>
              </div>
            </div>
          </div>
        )}
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
              isDisabled={
                form.deviceId.length === 0 ||
                isFetchingDevice ||
                selectedDeviceCurrentReservationCount >=
                  (accountStats?.maxUniqueDeviceReservationPerDay ?? 0)
              }
              label="Time"
              error={errors?.timeSlotId}
              options={dateAndDevice?.timeSlots ?? []}
              isOptionDisabled={(option: TimeSlot) => {
                if (
                  selectedDeviceCurrentReservationCount >=
                  (accountStats?.maxUniqueDeviceReservationPerDay ?? 0)
                ) {
                  return true;
                }

                const reservation = currentDateReservations?.get(option.id);
                if (reservation || (option?.booked ?? 1) > 0) {
                  return true;
                }
                return false;
              }}
              getOptionLabel={(option) => {
                const reservation = currentDateReservations?.get(option.id);
                if (reservation) {
                  return `${to12HR(option.startTime)} - ${to12HR(
                    option.endTime
                  )} | Already booked.`.toString();
                }
                let isAvailableText = "Available";
                if (option.booked ?? 1 > 0) {
                  isAvailableText = "Fully Booked";
                }
                return `${to12HR(option.startTime)} - ${to12HR(
                  option.endTime
                )} | ${isAvailableText}`.toString();
              }}
              getOptionValue={(option) => option.id}
              onChange={handleTimeSlotSelection}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={
              isFetchingDevice ||
              isFetchingTimeSlots ||
              selectedDeviceCurrentReservationCount >=
                (accountStats?.maxUniqueDeviceReservationPerDay ?? 0)
            }
          >
            Submit
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default ReserveModal;
