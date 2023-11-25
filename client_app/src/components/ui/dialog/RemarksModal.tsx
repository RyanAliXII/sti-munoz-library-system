import { ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { FC, FormEvent, useEffect } from "react";
import Modal from "react-responsive-modal";
import { object, string } from "yup";

interface RemarksModalProps extends ModalProps {
  title?: string;
  onProceed?: (text: string) => void;
}
const RemarksModal: FC<RemarksModalProps> = ({
  closeModal,
  isOpen,
  title,
  onProceed,
}) => {
  const { form, handleFormInput, errors, validate, resetForm, removeErrors } =
    useForm({
      initialFormData: {
        text: "",
      },
      schema: object({
        text: string()
          .required("This field is required.")
          .trim("This field is required"),
      }),
    });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const formValue = await validate();
      if (!formValue) return;
      onProceed?.(formValue.text);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    resetForm();
    removeErrors();
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <Modal
      open={isOpen}
      center
      showCloseIcon={false}
      onClose={closeModal}
      styles={{
        modal: {
          overflowY: "visible",
          maxWidth: "450px",
        },
      }}
      closeOnOverlayClick={true}
      classNames={{
        modal: "w-11/12 md:w-7/12 lg:w-3/12 rounded h-62",
      }}
    >
      <div>
        <div className="py-3">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <form onSubmit={onSubmit}>
          <div className="pb-4">
            <textarea
              className={`textarea textarea-bordered resize-none form-control w-full ${
                errors?.text ? "textarea-error" : ""
              }`}
              name="text"
              onChange={handleFormInput}
              value={form.text}
            ></textarea>
            <div className="text-error text-sm pt-1">{errors?.text}</div>
          </div>

          <button type="submit" className="btn btn-error btn-sm">
            Submit
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default RemarksModal;
