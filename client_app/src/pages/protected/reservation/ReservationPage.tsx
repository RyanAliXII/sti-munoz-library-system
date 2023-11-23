import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { useSearchParamsState } from "react-use-search-params-state";
import { useDateSlotsThisMonth } from "@hooks/data-fetching/date-slots";
import { format } from "date-fns";
import ReserveModal from "./ReserveModal";
import { useSwitch } from "@hooks/useToggle";
import { EventClickArg } from "@fullcalendar/core";
import { useDevices } from "@hooks/data-fetching/device";
import { useTimeSlotProfile } from "@hooks/data-fetching/time-slot-profile";
import { useState } from "react";
import { TimeSlotProfile } from "@definitions/types";

const ReservationPage = () => {
  const [timeSlotProfile, setTimeSlotProfile] = useState<TimeSlotProfile>({
    id: "",
    name: "",
    timeSlots: [],
  });
  const [filterParams, setFilterParams] = useSearchParamsState({
    start: { type: "string", default: "" },
    end: { type: "string", default: "" },
  });
  const { data: dateSlots } = useDateSlotsThisMonth({
    queryKey: ["dateSlots", filterParams],
  });
  const { data: profile } = useTimeSlotProfile({
    queryKey: ["timeSlotProfile", timeSlotProfile],
  });
  const {
    close: closeReserveModal,
    isOpen: isReserveModalOpen,
    open: openReserveModal,
  } = useSwitch();

  const onEventClick = (arg: EventClickArg) => {
    console.log();
    const profile = arg.event.extendedProps?.timeSlotProfile;
    if (!arg.event.extendedProps?.timeSlotProfile) return;
    setTimeSlotProfile(profile);
    openReserveModal();
  };

  const { data: devices } = useDevices({});
  return (
    <div className="p-2">
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
        closeModal={closeReserveModal}
        isOpen={isReserveModalOpen}
      />
    </div>
  );
};

export default ReservationPage;
