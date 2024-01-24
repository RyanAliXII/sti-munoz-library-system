import { ModalProps } from "@definitions/types";
import { useCollections } from "@hooks/data-fetching/collection";
import { Modal, Select } from "flowbite-react";
import React, { ChangeEvent, FC } from "react";

const ExportBooksModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const { data: collections } = useCollections();
  const onSelectColection = (event: ChangeEvent<HTMLSelectElement>) => {
    const collectionId = event.target.value ?? "";
    if (collectionId.length === 0) return;
  };
  return (
    <Modal show={isOpen} onClose={close} size={"3xl"}>
      <Modal.Header>Export Books</Modal.Header>
      <Modal.Body>
        <form>
          <div className="mt-5">
            <Select name="id" onChange={onSelectColection}>
              <option value="">Select Collection</option>
              {collections?.map((collection) => {
                return (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                );
              })}
            </Select>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ExportBooksModal;
