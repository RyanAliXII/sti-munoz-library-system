import LibraryIcon from "@assets/images/library-icon.svg";
import { ModalProps, Penalty } from "@definitions/types";
import { Button, Modal, Table } from "flowbite-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { forwardRef, useEffect, useRef } from "react";

interface EditPenaltyModalProps extends ModalProps {
  penalty: Penalty;
}
const ViewPenaltyModal = (props: EditPenaltyModalProps) => {
  const billRef = useRef<HTMLDivElement>(null);
  const download = async () => {
    if (!billRef.current) return;

    const canvas = await html2canvas(billRef.current, {
      scale: 5,
    });

    const doc = new jsPDF("l", "in", [6, 4.5]);
    doc.addImage(canvas, 0, 0, 6, 4);
    doc.save("test.pdf");
  };
  useEffect(() => {}, []);
  return (
    <Modal dismissible show={props.isOpen} onClose={props.closeModal}>
      <Modal.Header></Modal.Header>
      <Modal.Body className="overflow-x-scroll small-scroll">
        <ModalContent
          ref={billRef}
          closeModal={props.closeModal}
          penalty={props.penalty}
        ></ModalContent>
      </Modal.Body>
      <Modal.Footer>
        <Button color="primary" onClick={download}>
          Download
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
type ContentProps = {
  penalty: Penalty;
  closeModal: () => void;
};
const ModalContent = forwardRef<HTMLDivElement, ContentProps>(
  ({ penalty, closeModal }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white p-5  mx-auto border-gray-300 rounded"
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
          <Table className="w-full mt-5  dark:bg-white">
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
            <Table.Body className="bg-white text-gray-700 dark:bg-white dark:text-gray-700">
              <Table.Row className="bg-white text-gray-700 dark:bg-white dark:text-gray-700">
                <Table.Cell className="bg-white text-gray-700 dark:bg-white dark:text-gray-700">
                  {penalty.item}
                </Table.Cell>
                <Table.Cell className="bg-white text-gray-700 dark:bg-white dark:text-gray-700">
                  {penalty.description}
                </Table.Cell>
                <Table.Cell className="bg-white text-gray-700 dark:bg-white dark:text-gray-700">
                  {penalty.amount}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </section>
      </div>
    );
  }
);
export default ViewPenaltyModal;
