import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useTimeSlotProfile } from "@hooks/data-fetching/time-slot-profile";
import { Button, Table } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import NewTimeSlotModal from "./NewTimeSlotModal";
import { useSwitch } from "@hooks/useToggle";

const TimeSlotPage = () => {
  const navigate = useNavigate();
  const { data: profile } = useTimeSlotProfile({
    onError: () => {
      navigate("/404");
    },
  });
  const {
    close: closeNewSlotModal,
    open: openNewSlotModal,
    isOpen: isNewSlotModalOpen,
  } = useSwitch();
  const formatTime = (time: string) => {
    try {
      const dateString = "1970-01-01 " + time;
      const date = new Date(dateString);
      const formattedTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return formattedTime;
    } catch (error) {
      return "";
    }
  };
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
            <Table.HeadCell>Start Time</Table.HeadCell>
            <Table.HeadCell>End Time</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {profile?.timeSlots?.map((timeSlot) => {
              return (
                <Table.Row key={timeSlot.id}>
                  <Table.Cell>
                    <div className="font-semibold">
                      {formatTime(timeSlot.startTime)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="font-semibold">
                      {formatTime(timeSlot.endTime)}
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
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
