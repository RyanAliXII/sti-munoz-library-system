import { useLayoutEffect, useRef, useState } from "react";

import { ModalProps, Penalty } from "@definitions/types";
import { Button, Modal, Textarea } from "flowbite-react";

interface EditPenaltyModalProps extends ModalProps {
  penalty: Penalty;
}
const ViewPenaltyModal = (props: EditPenaltyModalProps) => {
  return (
    <Modal dismissible show={props.isOpen} onClose={props.closeModal}>
      <Modal.Body>
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
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaHeight, setTextAreaHeight] = useState<string>("0px");
  useLayoutEffect(() => {
    setTextAreaHeight(`${textAreaRef.current?.scrollHeight}px`);
  }, [textAreaRef.current]);
  return (
    <div>
      <div className="flex w-full p-5 border gap-3 items-center dark:border-gray-700 rounded">
        <div>
          <img
            className="w-12 rounded-full h-12"
            src={`https://ui-avatars.com/api/?name=${penalty?.account.givenName}${penalty?.account.surname}&background=2563EB&color=fff`}
          ></img>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-600">
            {penalty?.account.displayName}
          </span>
          <small className="text-gray-500 ml-0.5">
            {penalty?.account.email}
          </small>
        </div>
      </div>
      <div>
        <Textarea
          style={{
            height: textAreaHeight,
          }}
          ref={textAreaRef}
          readOnly={true}
          className="w-full  mt-1 focus:outline-none focus:ring-0 border-0 dark:bg-gray-800 bg-white  p-3 h-content border-none "
          defaultValue={penalty?.description}
        ></Textarea>
      </div>
      <div className="flex gap-1 mt-5">
        <Button color="light" onClick={closeModal}>
          Close
        </Button>
      </div>
    </div>
  );
};
export default ViewPenaltyModal;
