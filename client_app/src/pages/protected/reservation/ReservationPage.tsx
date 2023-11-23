import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useSearchParamsState } from "react-use-search-params-state";

import { format } from "date-fns";
import { useDateSlotsThisMonth } from "@hooks/data-fetching/date-slots";
import { useEffect } from "react";
const ReservationPage = () => {
  const [filterParams, setFilterParams] = useSearchParamsState({
    start: { type: "string", default: "" },
    end: { type: "string", default: "" },
  });
  const { data: dateSlots } = useDateSlotsThisMonth({
    queryKey: ["dateSlots", filterParams],
  });

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
        events={dateSlots?.map((slot) => {
          console.log(slot.date);
          return {
            className: "p-2 bg-success cursor-pointer",
            start: slot.date,
            title: "Open for Reservation",
          };
        })}
      />
    </div>
  );
};

export default ReservationPage;
