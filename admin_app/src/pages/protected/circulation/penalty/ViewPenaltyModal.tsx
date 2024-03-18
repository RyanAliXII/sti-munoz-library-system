import { ModalProps } from "@definitions/types";
import { Modal } from "flowbite-react";
interface EditPenaltyModalProps extends ModalProps {
  url: string;
}
const ViewPenaltyModal = (props: EditPenaltyModalProps) => {
  return (
    <Modal
      dismissible
      show={props.isOpen}
      onClose={props.closeModal}
      size="4xl"
    >
      <Modal.Header></Modal.Header>
      <Modal.Body className="overflow-x-scroll small-scroll">
        <iframe src={props.url} width="800px" height="900" />
      </Modal.Body>
    </Modal>
  );
};

export default ViewPenaltyModal;
