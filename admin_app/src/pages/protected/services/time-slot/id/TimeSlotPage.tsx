import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useTimeSlotProfile } from "@hooks/data-fetching/time-slot-profile";
import { Button, Table } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import NewTimeSlotModal from "./NewTimeSlotModal";
import { useSwitch } from "@hooks/useToggle";

const TimeSlotPage = () => {
  const navigate = useNavigate();
  const {} = useTimeSlotProfile({
    onError: () => {
      navigate("/404");
    },
  });
  const {
    close: closeNewSlotModal,
    open: openNewSlotModal,
    isOpen: isNewSlotModalOpen,
  } = useSwitch();
  return (
    <Container>
      <div className="py-3">
        <Button color="primary" onClick={openNewSlotModal}>
          New Slot
        </Button>
      </div>

      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>From</Table.HeadCell>
            <Table.HeadCell>To</Table.HeadCell>
          </Table.Head>
          <Table.Body></Table.Body>
        </Table>
      </TableContainer>
      <NewTimeSlotModal
        closeModal={closeNewSlotModal}
        isOpen={isNewSlotModalOpen}
      />
    </Container>
  );
};

export default TimeSlotPage;
