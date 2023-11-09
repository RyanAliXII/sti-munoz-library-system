import {
  DangerButton,
  LighButton,
  LightOutlineButton,
  PrimaryButton,
} from "../button/Button";
import { useState } from "react";
import { Input, InputProps } from "../form/Input";
import { Button, Modal } from "flowbite-react";
import {
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi";
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
    <Modal show={isOpen} dismissible onClose={close} size="md">
      <Modal.Body>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h2 className="text-lg  text-gray-900 dark:text-white">{title}</h2>
          <h3 className="mb-5 text-base font-normal text-gray-500 dark:text-gray-400">
            {text}
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={onConfirm}>
              {"Yes, I'm sure"}
            </Button>
            <Button color="light" onClick={close}>
              No, cancel
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const ConfirmDialog = ({
  title,
  text,
  close,
  isOpen,
  onConfirm,
}: DialogProps) => {
  if (!isOpen) return null;
  return (
    <Modal show={isOpen} dismissible onClose={close} size="md">
      <Modal.Body>
        <div className="text-center">
          <HiOutlineInformationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h2 className="text-lg  text-gray-900 dark:text-white">{title}</h2>
          <h3 className="mb-5 text-base font-normal text-gray-500 dark:text-gray-400">
            {text}
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="primary" onClick={onConfirm}>
              {"Yes, I'm sure"}
            </Button>
            <Button color="light" onClick={close}>
              No, cancel
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
    // <Modal show={isOpen} onClose={close}>
    //   <div className="w-96 rounded h-48 flex flex-col justify-center gap-4">
    //     <div className="w-11/12 mx-auto px-3 flex flex-col justify-center gap-2">
    //       <span className="text-xl font-semibold">{title}</span>
    //       <small className="text-sm text-gray-500">{text}</small>
    //     </div>
    //     <div className="flex w-11/12 mx-auto justify-center gap-5">
    //       <LightOutlineButton onClick={close} className="px-14">
    //         Cancel
    //       </LightOutlineButton>
    //       <PrimaryButton onClick={onConfirm} className="px-14">
    //         Confirm
    //       </PrimaryButton>
    //     </div>
    //   </div>
    // </Modal>
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
    <Modal onClose={close}>
      <div className="w-96 rounded">
        <div className="header w-full h-10 px-2 py-2 text-lg font-medium  text-gray-600">
          <span>{title}</span>
        </div>
        <div className="px-2 h-36 flex items-center">
          <div className="w-full ">
            <textarea
              className="
              block
              w-full
              px-3
              py-1.5
              text-base
              font-normal
              text-gray-700
              bg-white bg-clip-padding
              border border-solid border-gray-300
              rounded
              transition
              ease-in-out
              m-0
              h-28
              focus:text-gray-700 focus:bg-white focus:border-yellow-400 focus:outline-none
              resize-none"
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
type PromptInputDialogProps = {
  title?: string;
  label?: string;
  placeholder?: string;
  isOpen: boolean;
  proceedBtnText?: string;
  close: () => void;
  onProceed?: () => void;
  type?: string;
  error?: string;
  inputProps?: InputProps;
};
export const PromptInputDialog = ({
  title,
  close,
  isOpen,
  onProceed,
  proceedBtnText,
  inputProps,
}: PromptInputDialogProps) => {
  if (!isOpen) return null;
  return (
    <Modal show={isOpen} onClose={close}>
      <div className="w-96 rounded">
        <div className="header w-full h-10 px-2 py-2 text-lg font-medium  text-gray-600">
          <span>{title}</span>
        </div>
        <div className="px-2 h-28 flex items-center">
          <div className="w-full ">
            <Input {...inputProps} />
          </div>
        </div>
        <div className="flex gap-2 h-30 p-2 w-full justify-end">
          <LighButton onClick={close}>Cancel</LighButton>
          <PrimaryButton
            onClick={() => {
              onProceed?.();
            }}
          >
            {proceedBtnText}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};
