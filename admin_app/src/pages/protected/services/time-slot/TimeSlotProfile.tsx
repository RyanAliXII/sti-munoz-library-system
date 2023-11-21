import Container from "@components/ui/container/Container";
import { useTimeSlotProfiles } from "@hooks/data-fetching/time-slot-profile";
import { useSwitch } from "@hooks/useToggle";
import { Button, Table } from "flowbite-react";
import NewTimeSlotProfileModal from "./NewTimeSlotProfileModal";

const TimeSlotProfile = () => {
  const {
    close: closeNewProfileModal,
    open: openNewProfileModal,
    isOpen: isNewProfileModalOpen,
  } = useSwitch();
  const { data: profiles } = useTimeSlotProfiles({
    queryKey: ["profiles"],
  });
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
        <Table.Body className="divide-y dark:divide-gray-700">
          {profiles?.map((profile) => {
            return (
              <Table.Row key={profile.id}>
                <Table.Cell> {profile.name}</Table.Cell>
              </Table.Row>
            );
          })}
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
