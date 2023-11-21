import { CustomInput } from "@components/ui/form/Input";
import { EditModalProps, TimeSlotProfile } from "@definitions/types";
import {
  useEditTimeSlotProfile,
  useNewTimeSlotProfile,
} from "@hooks/data-fetching/time-slot-profile";
import { useForm } from "@hooks/useForm";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { TimeSlotProfileValidation } from "../schema";
import useModalToggleListener from "@hooks/useModalToggleListener";

const EditTimeSlotProfileModal: FC<EditModalProps<TimeSlotProfile>> = ({
  closeModal,
  isOpen,
  formData,
}) => {
  const { handleFormInput, validate, errors, setForm, form } = useForm<
    Omit<TimeSlotProfile, "id">
  >({
    initialFormData: {
      name: "",
    },
    schema: TimeSlotProfileValidation,
  });
  const queryClient = useQueryClient();
  const updateProfile = useEditTimeSlotProfile({
    onSuccess: () => {
      closeModal();
      toast.success("Time slot profile updated.");
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
      updateProfile.mutate(profile);
    } catch (error) {
      console.error(error);
    }
  };
  useModalToggleListener(isOpen, () => {
    if (!isOpen) return;
    setForm(formData);
  });
  return (
    <Modal show={isOpen} dismissible onClose={closeModal} size={"lg"}>
      <Modal.Header>Edit Profile</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <CustomInput
              name="name"
              label="Name"
              value={form.name}
              onChange={handleFormInput}
              error={errors?.name}
            />
          </div>
          <Button
            type="submit"
            color="primary"
            isProcessing={updateProfile.isLoading}
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

export default EditTimeSlotProfileModal;
