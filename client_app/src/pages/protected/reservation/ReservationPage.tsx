import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { useSearchParamsState } from "react-use-search-params-state";
import { useDateSlotsThisMonth } from "@hooks/data-fetching/date-slots";
import { format } from "date-fns";
import ReserveModal from "./ReserveModal";
import { useSwitch } from "@hooks/useToggle";
import { EventClickArg } from "@fullcalendar/core";

const ReservationPage = () => {
  const [filterParams, setFilterParams] = useSearchParamsState({
    start: { type: "string", default: "" },
    end: { type: "string", default: "" },
  });
  const { data: dateSlots } = useDateSlotsThisMonth({
    queryKey: ["dateSlots", filterParams],
  });
  const {
    close: closeReserveModal,
    isOpen: isReserveModalOpen,
    open: openReserveModal,
  } = useSwitch();

  const onEventClick = (arg: EventClickArg) => {
    console.log(arg);
    openReserveModal();
  };
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
          console.log(slot.date);
          return {
            className: "p-2 bg-green-500 cursor-pointer text-white",
            start: slot.date,
            allDay: true,
            title: "Open for Reservation",
          };
        })}
      />
      <ReserveModal
        closeModal={closeReserveModal}
        isOpen={isReserveModalOpen}
      />
    </div>
  );
};

export default ReservationPage;
