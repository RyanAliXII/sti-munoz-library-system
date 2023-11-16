import { ModalProps } from "@definitions/types";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "flowbite-react";
import React from "react";
import UploadArea from "./UploadArea";

const ImportAccountModal: React.FC<ModalProps> = ({ closeModal, isOpen }) => {
  const queryClient = useQueryClient();
  const refetch = () => {
    queryClient.invalidateQueries(["accounts"]);
  };
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible>
      <Modal.Header>Import Account</Modal.Header>
      <Modal.Body>
        <UploadArea refetch={refetch}></UploadArea>
      </Modal.Body>
    </Modal>
  );
};

export default ImportAccountModal;
