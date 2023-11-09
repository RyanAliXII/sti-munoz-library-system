import { Button, Modal, Textarea } from "flowbite-react";
import { useState } from "react";
import {
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { LighButton, PrimaryButton } from "../button/Button";
import { Input, InputProps } from "../form/Input";
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

  return (
    <Modal onClose={close} show={isOpen} size="lg">
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        <div>
          <div>
            <Textarea
              className="resize-none"
              placeholder={placeholder}
              onChange={(event) => {
                setText(event.target.value);
              }}
            ></Textarea>
          </div>
          {/* <Input label={label} placeholder={placeholder}></Input> */}
        </div>
        <div className="flex gap-2 h-30 p-2 w-full justify-end">
          <Button
            color="primary"
            onClick={() => {
              onProceed?.(text);
            }}
          >
            {proceedBtnText}
          </Button>
          <Button color="light" onClick={close}>
            Cancel
          </Button>
        </div>
      </Modal.Body>
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
