import { CustomInput } from "@components/ui/form/Input";
import { ModalProps, TimeSlotProfile } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { Button, Modal } from "flowbite-react";
import { FC } from "react";
import { FaSave } from "react-icons/fa";

const NewTimeSlotProfileModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const { handleFormInput } = useForm<TimeSlotProfile>({
    initialFormData: {
      id: "",
      name: "",
    },
  });
  return (
    <Modal show={isOpen} dismissible onClose={closeModal} size={"lg"}>
      <Modal.Header>New Profile</Modal.Header>
      <Modal.Body>
        <form>
          <div className="py-2">
            <CustomInput name="name" label="Name" onChange={handleFormInput} />
          </div>
          <Button type="submit" color="primary">
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
