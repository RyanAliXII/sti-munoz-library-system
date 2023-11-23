import { DateSlot } from "@definitions/types";
import { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { useDateSlotsThisMonth } from "@hooks/data-fetching/date-slots";
import { useDevices } from "@hooks/data-fetching/device";
import { useTimeSlotProfile } from "@hooks/data-fetching/time-slot-profile";
import { useSwitch } from "@hooks/useToggle";
import { format } from "date-fns";
import { useState } from "react";
import { useSearchParamsState } from "react-use-search-params-state";
import ReserveModal from "./ReserveModal";

const ReservationPage = () => {
  const [dateSlot, setDateSlot] = useState<DateSlot>({
    id: "",
    date: "",
    profileId: "",
    timeSlotProfile: {
      id: "",
      name: "",
    },
  });
  const [filterParams, setFilterParams] = useSearchParamsState({
    start: { type: "string", default: "" },
    end: { type: "string", default: "" },
  });
  const { data: dateSlots } = useDateSlotsThisMonth({
    queryKey: ["dateSlots", filterParams],
  });
  const { data: profile } = useTimeSlotProfile({
    queryKey: ["timeSlotProfile", dateSlot.timeSlotProfile],
  });
  const {
    close: closeReserveModal,
    isOpen: isReserveModalOpen,
    open: openReserveModal,
  } = useSwitch();

  const onEventClick = (arg: EventClickArg) => {
    console.log();
    const dateSlot = arg.event.extendedProps;
    if (!arg?.event?.extendedProps) return;
    setDateSlot(dateSlot as DateSlot);
    openReserveModal();
  };

  const { data: devices } = useDevices({});
  return (
    <div className="py-4 w-11/12 mx-auto lg:w-9/12">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        datesSet={(args) => {
          setFilterParams({
            start: format(args.start, "yyyy-MM-dd"),
            end: format(args.end, "yyyy-MM-dd"),
          });
        }}
        eventClick={onEventClick}
        events={dateSlots?.map((slot) => {
          return {
            className: "p-2 bg-green-500 cursor-pointer text-white",
            start: slot.date,
            allDay: true,
            title: "Open for Reservation",
            extendedProps: slot,
          };
        })}
      />
      <ReserveModal
        timeSlots={profile?.timeSlots ?? []}
        devices={devices ?? []}
        dateSlot={dateSlot}
        closeModal={closeReserveModal}
        isOpen={isReserveModalOpen}
      />
    </div>
  );
};

export default ReservationPage;
