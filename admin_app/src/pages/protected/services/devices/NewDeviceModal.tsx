import { CustomInput } from "@components/ui/form/Input";
import { Device, ModalProps } from "@definitions/types";
import { useNewDevice } from "@hooks/data-fetching/device";
import { useForm } from "@hooks/useForm";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { FC } from "react";
import { FaSave } from "react-icons/fa";

const NewDeviceModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const newDevice = useNewDevice({});
  const { handleFormInput } = useForm<Omit<Device, "id">>({
    initialFormData: {
      description: "",
      name: "",
      available: 0,
    },
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="xl">
      <Modal.Header>New Device</Modal.Header>
      <Modal.Body>
        <div className="py-2">
          <CustomInput label="Name" name="name" onChange={handleFormInput} />
        </div>
        <div className="py-2">
          <Label>Description</Label>
          <Textarea onChange={handleFormInput} className="resize-none" />
        </div>
        <div className="py-2">
          <CustomInput
            label="Available Devices"
            type="number"
            name="available"
            onChange={handleFormInput}
          />
        </div>
        <Button color="primary">
          <div className="flex gap-2 items-center">
            <FaSave />
            Save
          </div>
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default NewDeviceModal;
