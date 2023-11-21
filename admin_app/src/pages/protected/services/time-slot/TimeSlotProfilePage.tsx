import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { TimeSlotProfile } from "@definitions/types";
import {
  useDeleteTimeSlotProfile,
  useTimeSlotProfiles,
} from "@hooks/data-fetching/time-slot-profile";
import { useSwitch } from "@hooks/useToggle";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import EditTimeSlotProfileModal from "./EditTimeSlotProfileModal";
import NewTimeSlotProfileModal from "./NewTimeSlotProfileModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import TableContainer from "@components/ui/table/TableContainer";

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
  const {
    close: closeConfirmDelete,
    open: openConfirmDelete,
    isOpen: isConfirmDeleteOpen,
  } = useSwitch();
  const [profile, setProfile] = useState<TimeSlotProfile>({
    id: "",
    name: "",
  });
  const queryClient = useQueryClient();
  const { data: profiles } = useTimeSlotProfiles({
    queryKey: ["profiles"],
  });
  const initEdit = (profile: TimeSlotProfile) => {
    setProfile(profile);
    openEditProfileModal();
  };
  const initDelete = (profile: TimeSlotProfile) => {
    setProfile(profile);
    openConfirmDelete();
  };
  const deleteProfile = useDeleteTimeSlotProfile({
    onSuccess: () => {
      toast.success("Time slot profile deleted.");
      queryClient.invalidateQueries(["profiles"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onConfirmDelete = () => {
    closeConfirmDelete();
    deleteProfile.mutate(profile.id);
  };
  return (
    <Container>
      <div className="py-2">
        <Button color="primary" onClick={openNewProfileModal}>
          New Profile
        </Button>
      </div>
      <TableContainer>
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
                    <div className="flex items-center gap-2">
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
                      <Tippy content="Delete Profile">
                        <Button
                          color="failure"
                          onClick={() => {
                            initDelete(profile);
                          }}
                        >
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
      <NewTimeSlotProfileModal
        closeModal={closeNewProfileModal}
        isOpen={isNewProfileModalOpen}
      />
      <EditTimeSlotProfileModal
        formData={profile}
        closeModal={closeEditProfileModal}
        isOpen={isEditProfileModalOpen}
      />
      <DangerConfirmDialog
        close={closeConfirmDelete}
        isOpen={isConfirmDeleteOpen}
        title="Delete Time Slot Profile"
        text="Are you sure you want to delete profile?"
        onConfirm={onConfirmDelete}
      />
    </Container>
  );
};

export default TimeSlotProfilePage;
