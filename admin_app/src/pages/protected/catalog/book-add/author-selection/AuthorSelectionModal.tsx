import { ModalProps } from "@definitions/types";

import Modal from "react-responsive-modal";
import AuthorSelection from "./AuthorSelection";
import { useBookAddFormContext } from "../BookAddFormContext";

const AuthorSelectionModal = ({ closeModal, isOpen }: ModalProps) => {
  const { form } = useBookAddFormContext();
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
              You have selected:{" "}
              <span className="font-semibold">
                {form.authors.length}{" "}
                {form.authors.length > 1 ? "Authors" : "Author"}
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
