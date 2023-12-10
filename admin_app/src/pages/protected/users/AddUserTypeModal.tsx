import { CustomInput } from "@components/ui/form/Input";
import { ModalProps } from "@definitions/types";
import { Button, Modal } from "flowbite-react";
import { FC } from "react";
import { FaSave } from "react-icons/fa";

export const AddUserTypeModal: FC<ModalProps> = ({ isOpen, closeModal }) => {
  return (
    <Modal dismissible show={isOpen} onClose={closeModal} size="lg">
      <Modal.Header>New User Group</Modal.Header>
      <Modal.Body>
        <form>
          <div className="py-1">
            <CustomInput name="name" label="Name" />
          </div>
          <Button color="primary">
            <div className="flex items-center gap-2">
              <FaSave /> Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddUserTypeModal;
