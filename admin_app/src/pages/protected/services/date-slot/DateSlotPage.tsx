import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { DateSlot } from "@definitions/types";
import {
  useDateSlots,
  useDeleteDateSlots,
} from "@hooks/data-fetching/date-slot";
import { useSwitch } from "@hooks/useToggle";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Table } from "flowbite-react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
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
  const [dateSlot, setDateSlot] = useState<Omit<DateSlot, "timeSlotProfile">>({
    date: "",
    id: "",
    profileId: "",
  });
  const { data: slots } = useDateSlots({});
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };
  const queryClient = useQueryClient();
  const deleteSlot = useDeleteDateSlots({
    onSuccess: () => {
      toast.success("Slot deleleted.");
      queryClient.invalidateQueries(["dateSlots"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const initDelete = (slot: DateSlot) => {
    setDateSlot(slot);
    openDeleteConfirm();
  };
  const onConfirmDelete = () => {
    deleteSlot.mutate(dateSlot.id);
  };
  return (
    <Container>
      <div className="py-3">
        <Button color="primary" onClick={openNewSlotModal}>
          New Slot
        </Button>
      </div>
      <Table>
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
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      <NewDateSlotModal
        closeModal={closeNewSlotModal}
        isOpen={isNewSlotModalOpen}
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
