import { ModalProps } from "@definitions/types";
import { Modal } from "flowbite-react";
import React, { FC } from "react";

interface ReportPreviewModalProps extends ModalProps {
  url: string;
}
const ReportPreviewModal: FC<ReportPreviewModalProps> = ({
  closeModal,
  isOpen,
  url,
}) => {
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="10xl">
      <Modal.Header>Report Preview</Modal.Header>
      <Modal.Body
        style={{
          maxHeight: "850px",
        }}
      >
        <iframe className="w-full h-[700-px]" src={url} height="900px"></iframe>
      </Modal.Body>
    </Modal>
  );
};

export default ReportPreviewModal;
