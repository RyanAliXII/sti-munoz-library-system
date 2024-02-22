import { ModalProps } from "@definitions/types";
import { Modal } from "flowbite-react";
import { Virtuoso } from "react-virtuoso";

interface ErrorModalProps extends ModalProps {
  errors: string[];
}
const ErrorModal = ({ closeModal, isOpen, errors }: ErrorModalProps) => {
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible>
      <Modal.Header>Update Errors</Modal.Header>
      <Modal.Body style={{ maxHeight: "800px" }} className="small-scroll">
        <div className="bg-gray-700 p-4 rounded">
          <Virtuoso
            style={{ height: 700 }}
            className="small-scroll"
            data={errors ?? []}
            itemContent={(index, m) => (
              <p
                className="block dark:text-white text-sm p-1 text-red-500"
                key={index}
              >
                {"Error"} {":"} {m}
              </p>
            )}
          ></Virtuoso>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ErrorModal;
