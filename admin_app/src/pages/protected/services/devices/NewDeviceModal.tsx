import { CustomInput } from "@components/ui/form/Input";
import { ModalProps } from "@definitions/types";
import { Button, Modal, Textarea } from "flowbite-react";
import { FC } from "react";
import { FaSave } from "react-icons/fa";

const NewDeviceModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="xl">
      <Modal.Header>New Device</Modal.Header>
      <Modal.Body>
        <div className="py-2">
          <CustomInput label="Name" name="name" />
        </div>
        <div className="py-2">
          <Textarea />
        </div>
        <div className="py-2">
          <CustomInput type="number" />
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
