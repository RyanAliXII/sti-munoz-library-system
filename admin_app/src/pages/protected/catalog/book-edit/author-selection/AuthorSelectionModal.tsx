import { ModalProps } from "@definitions/types";

import Modal from "react-responsive-modal";

import { useBookEditFormContext } from "../BookEditFormContext";

import AuthorSelection from "./AuthorSelection";

const AuthorSelectionModal = ({ closeModal, isOpen }: ModalProps) => {
  const { form } = useBookEditFormContext();
  const numberOfAuthorSelected = form.authors.length;

  if (!isOpen) return null;
  return (
    <>
      <Modal
        open={isOpen}
        onClose={closeModal}
        showCloseIcon={false}
        styles={{
          modal: {
            maxWidth: "none",
            maxHeight: "90vh",
            minHeight: "90vh",
          },
        }}
        classNames={{
          modal: "lg:w-8/12 rounded  ",
        }}
      >
        <div>
          <div className="mb-3">
            <h3 className="text-2xl"> Authors</h3>
            <small>
              You have selected:
              <span className="font-semibold">
                {" "}
                {numberOfAuthorSelected}{" "}
                {numberOfAuthorSelected > 1 ? "Authors" : "Author"}
              </span>
            </small>

            <AuthorSelection />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AuthorSelectionModal;
