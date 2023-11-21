import Container from "@components/ui/container/Container";
import { Button, Table } from "flowbite-react";
import NewTimeSlotProfileModal from "./NewTimeSlotProfileModal";
import { useSwitch } from "@hooks/useToggle";

const TimeSlotProfile = () => {
  const {
    close: closeNewProfileModal,
    open: openNewProfileModal,
    isOpen: isNewProfileModalOpen,
  } = useSwitch();
  return (
    <Container>
      <div className="py-2">
        <Button color="primary" onClick={openNewProfileModal}>
          New Profile
        </Button>
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>Profile Name</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body>
          <Table.Row></Table.Row>
        </Table.Body>
      </Table>
      <NewTimeSlotProfileModal
        closeModal={closeNewProfileModal}
        isOpen={isNewProfileModalOpen}
      />
    </Container>
  );
};

export default TimeSlotProfile;
