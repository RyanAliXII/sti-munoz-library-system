import Modal from "react-responsive-modal";
import { DangerButton, LighButton } from "../forms/Forms";

type DialogProps = {
  title?: string;
  text?: string;
  isOpen: boolean;
  close: () => void;
  onConfirm?: () => void;
};
export const DangerConfirmDialog = ({
  title,
  text,
  close,
  isOpen,
  onConfirm,
}: DialogProps) => {
  if (!isOpen) return null;
  return (
    <Modal
      showCloseIcon={false}
      open={isOpen}
      center
      styles={{
        modalContainer: {
          boxShadow: "none",
        },
        modal: {
          padding: 0,
          borderRadius: "3px",
          border: "none",
          boxShadow: "none",
        },
      }}
      onClose={close}
    >
      <div className="w-96  rounded">
        <div className="header w-full h-10 px-2 py-1 text-lg font-medium border-b text-gray-600">
          {title}
        </div>
        <div className="px-2 h-20 border-b flex items-center">
          <small className="text-gray-500">{text}</small>
        </div>
        <div className="flex gap-2 h-30 p-2 w-full justify-end">
          <LighButton props={{ onClick: close }}>Cancel</LighButton>
          <DangerButton props={{ onClick: onConfirm }}>Confirm</DangerButton>
        </div>
      </div>
    </Modal>
  );
};
