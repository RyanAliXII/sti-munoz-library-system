import { LighButton } from "@components/ui/button/Button";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { ModalProps, Penalty } from "@definitions/types";

import Modal from "react-responsive-modal";
import { ref } from "yup";

interface EditPenaltyModalProps extends ModalProps {
  penalty: Penalty;
}
const ViewPenaltyModal = (props: EditPenaltyModalProps) => {
  if (!props.isOpen) return null;
  return (
    <Modal
      open={props.isOpen}
      closeOnEsc={true}
      closeOnOverlayClick={true}
      showCloseIcon={false}
      center={true}
      onClose={props.closeModal}
      focusTrapped={false}
      styles={{
        modal: { maxHeight: "none" },
      }}
      classNames={{
        modal: "w-11/12 lg:w-1/2 h-95 rounded border-none",
      }}
    >
      <ModalContent
        closeModal={props.closeModal}
        penalty={props.penalty}
      ></ModalContent>
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
      <div className="flex w-full p-5 border gap-3 items-center">
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
        <textarea
          style={{
            height: textAreaHeight,
          }}
          ref={textAreaRef}
          readOnly={true}
          className="w-full   mt-1 focus:outline-none  p-3 h-content border-none"
          defaultValue={penalty?.description}
        ></textarea>
      </div>
      <div className="flex gap-1 mt-5">
        <LighButton onClick={closeModal}>Close</LighButton>
      </div>
    </div>
  );
};
export default ViewPenaltyModal;
