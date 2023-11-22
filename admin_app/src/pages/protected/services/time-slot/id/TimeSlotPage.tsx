import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useTimeSlotProfile } from "@hooks/data-fetching/time-slot-profile";
import { Button, Table } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import NewTimeSlotModal from "./NewTimeSlotModal";
import { useSwitch } from "@hooks/useToggle";
import EditTimeSlotModal from "./EditTimeSlotModal";
import { useState } from "react";
import { TimeSlot } from "@definitions/types";
import Tippy from "@tippyjs/react";
import { AiOutlineEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";

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
  const {
    close: closeEditSlotModal,
    open: openEditSlotModal,
    isOpen: isEditSlotModalOpen,
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
  const [timeSlot, setTimeSlot] = useState<TimeSlot>({
    endTime: "",
    id: "",
    profileId: "",
    startTime: "",
  });
  const initEdit = (timeSlot: TimeSlot) => {
    setTimeSlot(timeSlot);
    openEditSlotModal();
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
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
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
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Tippy content="Edit Profile">
                        <Button
                          color="secondary"
                          onClick={() => {
                            initEdit(timeSlot);
                          }}
                        >
                          <AiOutlineEdit />
                        </Button>
                      </Tippy>
                      <Tippy content="Delete Profile">
                        <Button color="failure">
                          <FaTrash />
                        </Button>
                      </Tippy>
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
      <EditTimeSlotModal
        closeModal={closeEditSlotModal}
        formData={timeSlot}
        isOpen={isEditSlotModalOpen}
      />
    </Container>
  );
};

export default TimeSlotPage;
