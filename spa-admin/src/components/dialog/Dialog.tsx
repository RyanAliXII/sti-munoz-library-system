import Modal from "react-responsive-modal";
import {
  DangerButton,
  LighButton,
  PrimaryButton,
  TextAreaClasses,
} from "../forms/Forms";
import { VscReplaceAll } from "react-icons/vsc";
import { useState } from "react";

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
      <div className="w-96 rounded h-48 flex flex-col justify-center gap-4">
        <div className="w-11/12 mx-auto px-3 flex flex-col justify-center">
          <span className="text-xl font-semibold">{title}</span>
          <small className="text-sm text-gray-500">{text}</small>
        </div>
        <div className="flex w-11/12 mx-auto justify-center gap-5">
          <LighButton onClick={close} className="px-14">
            Cancel
          </LighButton>
          <DangerButton onClick={onConfirm} className="px-14">
            Confirm
          </DangerButton>
        </div>
      </div>
    </Modal>
  );
};

type PromptDialogProps = {
  title?: string;
  label?: string;
  placeholder?: string;
  isOpen: boolean;
  proceedBtnText?: string;
  close: () => void;
  onProceed?: (text: string) => void;
};
export const PromptTextAreaDialog = ({
  title,
  close,
  isOpen,
  onProceed,
  placeholder,
  proceedBtnText,
}: PromptDialogProps) => {
  const [text, setText] = useState<string>("");
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
      <div className="w-96 rounded">
        <div className="header w-full h-10 px-2 py-2 text-lg font-medium border-b text-gray-600">
          <span>{title}</span>
        </div>
        <div className="px-2 h-36 border-b flex items-center">
          <div className="w-full ">
            <textarea
              className={TextAreaClasses.DefaultClasslist}
              placeholder={placeholder}
              onChange={(event) => {
                setText(event.target.value);
              }}
            ></textarea>
          </div>
          {/* <Input label={label} placeholder={placeholder}></Input> */}
        </div>
        <div className="flex gap-2 h-30 p-2 w-full justify-end">
          <LighButton onClick={close}>Cancel</LighButton>
          <PrimaryButton
            onClick={() => {
              onProceed?.(text);
            }}
          >
            {proceedBtnText}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};
