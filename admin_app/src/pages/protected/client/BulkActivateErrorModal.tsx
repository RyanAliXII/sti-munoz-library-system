import { ModalProps } from "@definitions/types";
import { Modal, Textarea } from "flowbite-react";
import React, { FC } from "react";

interface ErrorModalProps extends ModalProps {
  messages: string[];
}
const BulkActivateErrorModal: FC<ErrorModalProps> = ({
  closeModal,
  isOpen,
  messages,
}) => {
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible>
      <Modal.Header>Upload Errors</Modal.Header>
      <Modal.Body>
        <div className="bg-gray-700 p-4 rounded max-h-96 overflow-y-scroll">
          {messages.map((m, index) => {
            return (
              <p
                className="block  text-sm p-1 text-red-500"
                key={index}
              >
                {"Error"} {":"} {m}
              </p>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BulkActivateErrorModal;
