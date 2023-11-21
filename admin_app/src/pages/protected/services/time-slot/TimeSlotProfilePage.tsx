import Container from "@components/ui/container/Container";
import { useTimeSlotProfiles } from "@hooks/data-fetching/time-slot-profile";
import { useSwitch } from "@hooks/useToggle";
import { Button, Table } from "flowbite-react";
import NewTimeSlotProfileModal from "./NewTimeSlotProfileModal";
import EditTimeSlotProfileModal from "./EditTimeSlotProfileModal";
import { useState } from "react";
import { TimeSlotProfile } from "@definitions/types";
import Tippy from "@tippyjs/react";
import { AiOutlineEdit } from "react-icons/ai";

const TimeSlotProfilePage = () => {
  const {
    close: closeNewProfileModal,
    open: openNewProfileModal,
    isOpen: isNewProfileModalOpen,
  } = useSwitch();
  const {
    close: closeEditProfileModal,
    open: openEditProfileModal,
    isOpen: isEditProfileModalOpen,
  } = useSwitch();
  const [profile, setProfile] = useState<TimeSlotProfile>({
    id: "",
    name: "",
  });
  const { data: profiles } = useTimeSlotProfiles({
    queryKey: ["profiles"],
  });
  const initEdit = (profile: TimeSlotProfile) => {
    setProfile(profile);
    openEditProfileModal();
  };
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
                <Table.Cell>
                  <div>
                    <Tippy content="Edit Profile">
                      <Button
                        color="secondary"
                        onClick={() => {
                          initEdit(profile);
                        }}
                      >
                        <AiOutlineEdit />
                      </Button>
                    </Tippy>
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      <NewTimeSlotProfileModal
        closeModal={closeNewProfileModal}
        isOpen={isNewProfileModalOpen}
      />
      <EditTimeSlotProfileModal
        formData={profile}
        closeModal={closeEditProfileModal}
        isOpen={isEditProfileModalOpen}
      />
    </Container>
  );
};

export default TimeSlotProfilePage;
