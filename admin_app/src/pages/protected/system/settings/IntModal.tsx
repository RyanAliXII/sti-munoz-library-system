import { Button, Modal } from "flowbite-react";
import { FC } from "react";
import { InputModalProps } from "./SettingsPage";
import { CustomInput } from "@components/ui/form/Input";
import { FaSave } from "react-icons/fa";

const IntModal: FC<InputModalProps> = ({
  label,
  isOpen,
  closeModal,
  value,
}) => {
  return (
    <Modal show={isOpen} onClose={closeModal} size="lg" dismissible>
      <Modal.Header>{label}</Modal.Header>
      <Modal.Body>
        <form>
          <div className="py-2">
            <CustomInput></CustomInput>
          </div>
          <Button color="primary">
            <div className="flex gap-2">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default IntModal;
