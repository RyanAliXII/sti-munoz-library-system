import { ModalProps } from "@definitions/types";

import { useBookEditFormContext } from "../BookEditFormContext";

import AuthorSelection from "./AuthorSelection";
import { Modal } from "flowbite-react";

const AuthorSelectionModal = ({ closeModal, isOpen }: ModalProps) => {
  const { form } = useBookEditFormContext();

  if (!isOpen) return null;
  return (
    <>
      <Modal
        show={isOpen}
        onClose={closeModal}
        size={"4xl"}
        position={"center"}
        dismissible
      >
        <Modal.Header>
          You have selected:{" "}
          <span className="font-semibold">
            {form.authors.length}{" "}
            {form.authors.length > 1 ? "Authors" : "Author"}
          </span>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "700px" }}>
          <AuthorSelection />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AuthorSelectionModal;
