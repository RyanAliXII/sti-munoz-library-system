import Divider from "@components/ui/divider/Divider";
import { CustomInput } from "@components/ui/form/Input";
import { BorrowedBook, ModalProps } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { BorrowStatus } from "@internal/borrow-status";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, Label, Modal, Textarea } from "flowbite-react";
import { ChangeEvent, FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { ReturnBookSchema } from "./schema";
import FieldError from "@components/ui/form/FieldError";
import { AxiosError } from "axios";
import useModalToggleListener from "@hooks/useModalToggleListener";

interface ReturnBookModalProps extends ModalProps {
  borrowedBook?: BorrowedBook;
}
const ReturnBookModal: FC<ReturnBookModalProps> = ({
  closeModal,
  isOpen,
  borrowedBook,
}) => {
  const {
    form,
    setForm,
    resetForm,
    handleFormInput,
    errors,
    validate,
    setErrors,
  } = useForm({
    initialFormData: {
      remarks: "",
      penaltyAmount: 0,
      penaltyDescription: "",
      hasAdditionalPenalty: false,
    },
    schema: ReturnBookSchema,
  });
  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setForm((prev) => ({ ...prev, hasAdditionalPenalty: checked }));
  };
  const { Patch } = useRequest();
  const updateStatus = useMutation({
    mutationFn: (body: {
      remarks: string;
      hasAdditionalPenalty: boolean;
      penaltyAmount: number;
      penaltyDescription: string;
    }) =>
      Patch(`/borrowing/borrowed-books/${borrowedBook?.id}/status`, body, {
        params: {
          statusId: BorrowStatus.Returned,
        },
      }),
    onSuccess: () => {
      toast.success("Borrowed book has been updated.");
      queryClient.invalidateQueries(["transaction"]);
      closeModal();
    },
    onError: (error: AxiosError<any, any>) => {
      const { data } = error.response?.data;
      if (data?.errors) {
        setErrors(data?.errors);
      }
    },
  });
  const queryClient = useQueryClient();
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const parsedForm = await validate();
      if (!parsedForm) return;
      updateStatus.mutate(parsedForm);
    } catch (error) {
      console.error(error);
    }
  };
  useModalToggleListener(isOpen, () => {
    if (!isOpen) {
      resetForm();
    }
  });
  if (!borrowedBook) return null;
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size={"lg"}>
      <Modal.Header>Return Book</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div>
            <Label>Remarks</Label>
            <Textarea
              name="remarks"
              value={form.remarks}
              onChange={handleFormInput}
              className="resize-none"
            ></Textarea>
          </div>
          <div className=" flex gap-2 mt-3 mb-2">
            <Checkbox onChange={handleCheck} color="primary" />
            <Label>Additional Penalty</Label>
          </div>

          {form.hasAdditionalPenalty && (
            <div className="mt-5">
              <Divider />
              <div className="pb-2">
                <Label>Penalty Description</Label>
                <Textarea
                  name="penaltyDescription"
                  onChange={handleFormInput}
                  value={form.penaltyDescription}
                ></Textarea>
                <FieldError error={errors?.penaltyDescription} />
              </div>
              <div className="pb-2">
                <CustomInput
                  value={form.penaltyAmount}
                  name="penaltyAmount"
                  onChange={handleFormInput}
                  label="Amount"
                  error={errors?.penaltyAmount}
                ></CustomInput>
              </div>
            </div>
          )}
          <Button type="submit" color="primary">
            <div className="flex gap-2 items-center">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ReturnBookModal;
