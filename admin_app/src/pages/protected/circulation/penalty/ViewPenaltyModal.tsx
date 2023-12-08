import { useLayoutEffect, useRef, useState } from "react";
import { ModalProps, Penalty } from "@definitions/types";
import { Modal, Table } from "flowbite-react";
import LibraryIcon from "@assets/images/library-icon.svg";
interface EditPenaltyModalProps extends ModalProps {
  penalty: Penalty;
}
const ViewPenaltyModal = (props: EditPenaltyModalProps) => {
  return (
    <Modal dismissible show={props.isOpen} onClose={props.closeModal}>
      <Modal.Body className="overflow-x-scroll small-scroll">
        <ModalContent
          closeModal={props.closeModal}
          penalty={props.penalty}
        ></ModalContent>
      </Modal.Body>
    </Modal>
  );
};

const ModalContent = ({
  penalty,
  closeModal,
}: {
  penalty: Penalty;
  closeModal: () => void;
}) => {
  return (
    <div
      className="bg-white p-5 border mx-auto border-gray-300 rounded"
      style={{ width: "550px" }}
    >
      <section className="flex items-center justify-center w-full flex-col">
        <img src={LibraryIcon} width={"60px"} height={"60px"}>
          {}
        </img>

        <h1 className="text-lg font-semibold">STI Munoz Library</h1>
      </section>
      <section className="mt-5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs">Patron</div>
            <span className="text-sm font-semibold">
              {penalty.account.givenName} {penalty.account.surname}
            </span>
          </div>
          <div className="">
            <div className="text-xs">Program/Strand </div>
            <span className="text-sm font-semibold">
              {penalty.account?.programCode.length === 0
                ? "N/A"
                : penalty.account.programCode}
            </span>
          </div>
          <div className="">
            <div className="text-xs">Student Number </div>
            <span className="text-sm font-semibold">
              {(penalty.account?.studentNumber?.length ?? 0) === 0
                ? "N/A"
                : penalty.account.studentNumber}
            </span>
          </div>
          <div className="">
            <div className="text-xs">Reference # </div>
            <span className="text-sm font-semibold">
              {penalty.referenceNumber}
            </span>
          </div>
        </div>
        <Table className="w-full mt-5">
          <Table.Head>
            <Table.HeadCell className="bg-gray-200 text-gray-700 dark:bg-gray-200 dark:text-gray-700">
              Item
            </Table.HeadCell>
            <Table.HeadCell className="bg-gray-200 text-gray-700 dark:bg-gray-200  dark:text-gray-700">
              Description
            </Table.HeadCell>
            <Table.HeadCell className="bg-gray-200 text-gray-700 dark:bg-gray-200  dark:text-gray-700">
              Penalty
            </Table.HeadCell>
          </Table.Head>
          <Table.Body>
            <Table.Cell className="text-gray-900">{penalty.item}</Table.Cell>
            <Table.Cell className="text-gray-900">
              {penalty.description}
            </Table.Cell>
            <Table.Cell className="text-gray-900">{penalty.amount}</Table.Cell>
          </Table.Body>
        </Table>
      </section>
    </div>
  );
};
export default ViewPenaltyModal;
