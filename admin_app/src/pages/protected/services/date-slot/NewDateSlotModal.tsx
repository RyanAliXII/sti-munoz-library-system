import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import { ModalProps } from "@definitions/types";
import { Button, Modal } from "flowbite-react";
import { FC } from "react";
import { FaSave } from "react-icons/fa";

const NewDateSlotModal: FC<ModalProps> = ({ isOpen, closeModal }) => {
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>New Slots</Modal.Header>
      <Modal.Body>
        <form>
          <div className="py-2">
            <CustomDatePicker
              minDate={new Date()}
              label="From"
              onChange={() => {}}
            />
          </div>
          <div className="py-2">
            <CustomDatePicker
              minDate={new Date()}
              label="To"
              onChange={() => {}}
            />
          </div>
          <Button color="primary">
            <div className="flex items-center gap-2">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default NewDateSlotModal;
