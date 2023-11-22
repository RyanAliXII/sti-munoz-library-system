import Container from "@components/ui/container/Container";
import { Button, Table } from "flowbite-react";
import NewDateSlotModal from "./NewDateSlotModal";
import { useSwitch } from "@hooks/useToggle";

const DateSlotPage = () => {
  const {
    close: closeNewSlotModal,
    isOpen: isNewSlotModalOpen,
    open: openNewSlotModal,
  } = useSwitch();
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
        <Table.Body></Table.Body>
      </Table>
      <NewDateSlotModal
        closeModal={closeNewSlotModal}
        isOpen={isNewSlotModalOpen}
      />
    </Container>
  );
};

export default DateSlotPage;
