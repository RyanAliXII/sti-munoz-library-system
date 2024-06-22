import HasAccess from "@components/auth/HasAccess";
import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { DateSlot } from "@definitions/types";
import { EventClickArg, EventInput, EventSourceFunc } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { useDeleteDateSlots } from "@hooks/data-fetching/date-slot";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { format } from "date-fns";
import { Button } from "flowbite-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import EditDateSlotModal from "./EditDateSlotModalProps";
import NewDateSlotModal from "./NewDateSlotModal";
const DateSlotPage = () => {
  const {
    close: closeNewSlotModal,
    isOpen: isNewSlotModalOpen,
    open: openNewSlotModal,
  } = useSwitch();
  const {
    close: closeDeleteConfirm,
    isOpen: isDeleteConfirmOpen,
    open: openDeleteConfirm,
  } = useSwitch();
  const editModal = useSwitch();
  const [dateSlot, setDateSlot] = useState<DateSlot>({
    date: "",
    id: "",
    profileId: "",
    timeSlotProfile: {
      id: "",
      name: "",
      timeSlots: [],
    },
  });

  const deleteSlot = useDeleteDateSlots({
    onSuccess: () => {
      toast.success("Slot deleted.");
      refetchEvents();
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
    onSettled: () => {
      closeDeleteConfirm();
    },
  });
  const initDelete = (slot: DateSlot) => {
    setDateSlot(slot);
    openDeleteConfirm();
  };
  const onConfirmDelete = () => {
    deleteSlot.mutate(dateSlot.id);
  };
  const { Get } = useRequest();
  const calendarRef = useRef<InstanceType<typeof FullCalendar>>(null);
  const refetchEvents = () => {
    calendarRef.current?.getApi().refetchEvents();
  };
  const fetchSlots: EventSourceFunc = useCallback(async (args, success) => {
    try {
      const response = await Get("/date-slots", {
        params: {
          start: format(args.start, "yyyy-MM-dd"),
          end: format(args.end, "yyyy-MM-dd"),
        },
      });

      const { data } = await response.data;
      const slots = (data?.dateSlots ?? []) as DateSlot[];
      const events: EventInput[] = slots?.map((slot) => ({
        allDay: true,
        title: "Open for reservation",
        className: "cursor-pointer bg-green-500",
        date: slot.date,
        extendedProps: slot,
      }));

      success(events ?? {});
    } catch (error) {
      console.error(error);
    }
  }, []);
  const handleEventClick = useCallback((arg: EventClickArg) => {
    const slot = arg.event.extendedProps as DateSlot;
    setDateSlot(slot);
    editModal.open();
  }, []);
  return (
    <Container>
      <div className="py-3">
        <HasAccess requiredPermissions={["DateSlot.Add"]}>
          <Button color="primary" onClick={openNewSlotModal}>
            New Slot
          </Button>
        </HasAccess>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={fetchSlots}
        eventClick={handleEventClick}
      ></FullCalendar>
      {/* <Table>
        <Table.Head>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Time Slot Profile</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y dark:divide-gray-700">
          {slots?.map((slot) => {
            return (
              <Table.Row key={slot.id}>
                <Table.Cell>{formatDate(slot.date)}</Table.Cell>
                <Table.Cell>{slot.timeSlotProfile.name}</Table.Cell>
                <Table.Cell>
                  <HasAccess requiredPermissions={["DateSlot.Delete"]}>
                    <div className="flex items-center gap-2">
                      <Button
                        color="failure"
                        onClick={() => {
                          initDelete(slot);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </HasAccess>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table> */}

      <NewDateSlotModal
        refetchEvents={refetchEvents}
        closeModal={closeNewSlotModal}
        isOpen={isNewSlotModalOpen}
      />
      <EditDateSlotModal
        refetchEvents={refetchEvents}
        initDelete={initDelete}
        isOpen={editModal.isOpen}
        closeModal={editModal.close}
        slot={dateSlot}
      />
      <DangerConfirmDialog
        title="Delete Date Slot"
        text="Are you sure you want to delete date slot?"
        close={closeDeleteConfirm}
        isOpen={isDeleteConfirmOpen}
        onConfirm={onConfirmDelete}
      />
    </Container>
  );
};

export default DateSlotPage;
