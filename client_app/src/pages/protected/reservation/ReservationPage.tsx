import { DateSlot } from "@definitions/types";
import { EventClickArg, EventSourceFunc } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { useDevices } from "@hooks/data-fetching/device";
import { useTimeSlotProfile } from "@hooks/data-fetching/time-slot-profile";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { format } from "date-fns";
import { useCallback, useRef, useState } from "react";
import ReservationList from "./ReservationList";
import ReserveModal from "./ReserveModal";
import { TabItem, Tabs } from "flowbite-react";
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
  const { data: profile } = useTimeSlotProfile({
    queryKey: ["timeSlotProfile", dateSlot.timeSlotProfile],
  });
  const {
    close: closeReserveModal,
    isOpen: isReserveModalOpen,
    open: openReserveModal,
  } = useSwitch();

  const onEventClick = useCallback((arg: EventClickArg) => {
    const dateSlot = arg.event.extendedProps;
    if (!arg?.event?.extendedProps) return;
    setDateSlot(dateSlot as DateSlot);
    openReserveModal();
  }, []);
  const { Get } = useRequest();
  const { data: devices } = useDevices({});

  const fetchEvents: EventSourceFunc = useCallback(
    async (info, successCallback) => {
      try {
        const { data: response } = await Get("/date-slots", {
          params: {
            start: format(info.start, "yyyy-MM-dd"),
            end: format(info.end, "yyyy-MM-dd"),
          },
        });

        const { data } = response;
        const dateSlots = (data?.dateSlots ?? []) as DateSlot[];
        successCallback(
          dateSlots?.map((slot) => {
            return {
              className: "p-2 bg-green-500 cursor-pointer text-white",
              start: slot.date,
              allDay: true,
              title: "Open for Reservation",
              extendedProps: slot,
            };
          })
        );
      } catch (err) {}
    },
    []
  );
  const fullCalendar = useRef<FullCalendar>(null);
  return (
    <div className="py-4 w-11/12 mx-auto lg:w-9/12">
      <Tabs>
          <TabItem title="Reserve">
          <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          validRange={{
            start: new Date(),
          }}
          ref={fullCalendar}
          eventClick={onEventClick}
          events={fetchEvents}
        />
          </TabItem>
          <TabItem title="Reservations">
          <ReservationList />
          </TabItem>
      </Tabs>
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
