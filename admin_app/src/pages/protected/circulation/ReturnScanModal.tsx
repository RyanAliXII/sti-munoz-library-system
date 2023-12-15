import { ModalProps } from "@definitions/types";
import { Modal, Table } from "flowbite-react";
import { FC } from "react";

const ReturnScanModal: FC<ModalProps> = ({ isOpen, closeModal }) => {
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="4xl">
      <Modal.Header>Scanned Books</Modal.Header>
      <Modal.Body>
        <Table>
          <Table.Head>
            <Table.HeadCell>Book</Table.HeadCell>
            <Table.HeadCell>Accession Number</Table.HeadCell>
            <Table.HeadCell>Patron</Table.HeadCell>
          </Table.Head>
          <Table.Body></Table.Body>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default ReturnScanModal;
