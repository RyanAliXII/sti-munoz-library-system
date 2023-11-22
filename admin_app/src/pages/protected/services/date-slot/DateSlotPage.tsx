import Container from "@components/ui/container/Container";
import { Button, Table } from "flowbite-react";
import NewDateSlotModal from "./NewDateSlotModal";
import { useSwitch } from "@hooks/useToggle";
import { useDateSlots } from "@hooks/data-fetching/date-slot";

const DateSlotPage = () => {
  const {
    close: closeNewSlotModal,
    isOpen: isNewSlotModalOpen,
    open: openNewSlotModal,
  } = useSwitch();
  const { data: slots } = useDateSlots({});
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
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
        </Table.Head>
        <Table.Body className="divide-y dark:divide-gray-700">
          {slots?.map((slot) => {
            return (
              <Table.Row key={slot.id}>
                <Table.Cell>{formatDate(slot.date)}</Table.Cell>
                <Table.Cell>{slot.timeSlotProfile.name}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      <NewDateSlotModal
        closeModal={closeNewSlotModal}
        isOpen={isNewSlotModalOpen}
      />
    </Container>
  );
};

export default DateSlotPage;
