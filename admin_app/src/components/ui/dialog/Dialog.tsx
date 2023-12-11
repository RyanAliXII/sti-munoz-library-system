import { Button, ButtonProps, Modal, Textarea } from "flowbite-react";
import { FormEvent, useState } from "react";
import {
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { LighButton, PrimaryButton } from "../button/Button";
import { CustomInput, Input, InputProps } from "../form/Input";
import { MdOutlineWarning } from "react-icons/md";
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

export const WarningConfirmDialog = ({
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
          <MdOutlineWarning className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h2 className="text-lg  text-gray-900 dark:text-white">{title}</h2>
          <h3 className="mb-5 text-base font-normal text-gray-500 dark:text-gray-400">
            {text}
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="warning" onClick={onConfirm}>
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
  submitButtonsProps?: ButtonProps;
};
export const PromptTextAreaDialog = ({
  title,
  close,
  isOpen,
  onProceed,
  placeholder,
  proceedBtnText,
  submitButtonsProps,
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
        </div>
        <div className="flex gap-2 h-30 p-2 w-full justify-end">
          <Button
            color="primary"
            onClick={() => {
              onProceed?.(text);
            }}
            {...submitButtonsProps}
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
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onProceed?.();
  };
  return (
    <Modal show={isOpen} onClose={close} size="lg">
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <CustomInput {...inputProps} />
          </div>
          <div className="flex gap-2">
            <Button color="primary" type="submit">
              {proceedBtnText}
            </Button>
            <Button color="light" onClick={close}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};
