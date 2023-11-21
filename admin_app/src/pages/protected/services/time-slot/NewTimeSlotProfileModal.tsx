import { CustomInput } from "@components/ui/form/Input";
import { ModalProps, TimeSlotProfile } from "@definitions/types";
import { useNewTimeSlotProfile } from "@hooks/data-fetching/time-slot-profile";
import { useForm } from "@hooks/useForm";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { TimeSlotProfileValidation } from "../schema";
import useModalToggleListener from "@hooks/useModalToggleListener";

const NewTimeSlotProfileModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const { handleFormInput, validate, errors, resetForm } = useForm<
    Omit<TimeSlotProfile, "id">
  >({
    initialFormData: {
      name: "",
    },
    schema: TimeSlotProfileValidation,
  });
  const queryClient = useQueryClient();
  const newProfile = useNewTimeSlotProfile({
    onSuccess: () => {
      closeModal();
      toast.success("Time slot profile added.");
      queryClient.invalidateQueries(["profiles"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const profile = await validate();
      if (!profile) return;
      newProfile.mutate(profile);
    } catch (error) {
      console.error(error);
    }
  };
  useModalToggleListener(isOpen, () => {
    if (!isOpen) resetForm();
  });
  return (
    <Modal show={isOpen} dismissible onClose={closeModal} size={"lg"}>
      <Modal.Header>New Profile</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <CustomInput
              name="name"
              label="Name"
              onChange={handleFormInput}
              error={errors?.name}
            />
          </div>
          <Button
            type="submit"
            color="primary"
            isProcessing={newProfile.isLoading}
          >
            <div className="flex gap-2 items-center">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default NewTimeSlotProfileModal;
