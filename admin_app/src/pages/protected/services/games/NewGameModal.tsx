import { CustomInput } from "@components/ui/form/Input";
import { ModalProps } from "@definitions/types";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { FC } from "react";
import { FaSave } from "react-icons/fa";

const NewGameModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  return (
    <Modal show={isOpen} dismissible onClose={closeModal} size={"xl"}>
      <Modal.Header>New Game</Modal.Header>
      <Modal.Body>
        <CustomInput label="Name"></CustomInput>
        <Label>Description</Label>
        <Textarea className="resize-none"></Textarea>
        <Button color="primary" className="mt-2">
          <div className="flex gap-2 items-center">
            <FaSave />
            Save
          </div>
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default NewGameModal;
