import { CustomInput } from "@components/ui/form/Input";
import {
  EditModalProps,
  ModalProps,
  PenaltyClassification,
} from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { PerformanceMark } from "perf_hooks";
import React, { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { PenaltyClassificationSchema } from "../schema";
import { error } from "console";
import FieldError from "@components/ui/form/FieldError";
import {
  useEditPenaltyClass,
  useNewPenaltyClass,
} from "@hooks/data-fetching/penalty";
import { StatusCodes } from "http-status-codes";
import { toast } from "react-toastify";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useQueryClient } from "@tanstack/react-query";

const EditPenaltyClassModal: FC<EditModalProps<PenaltyClassification>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const {
    form,
    handleFormInput,
    errors,
    validate,
    setErrors,
    resetForm,
    removeErrors,
    setForm,
  } = useForm<PenaltyClassification>({
    initialFormData: {
      id: "",
      description: "",
      name: "",
      amount: 0,
    },
    schema: PenaltyClassificationSchema,
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const parsedForm = await validate();
      if (!parsedForm) return;
      editPenaltyClass.mutate(parsedForm);
    } catch (error) {}
  };
  const queryClient = useQueryClient();
  const editPenaltyClass = useEditPenaltyClass({
    onSuccess: () => {
      toast.success("Penalty classification updated.");
      resetForm();
      queryClient.invalidateQueries(["penaltyClasses"]);
      closeModal();
    },
    onError: (error) => {
      const status = error.response?.status;
      const { data } = error.response?.data;
      if (status === StatusCodes.BAD_REQUEST) {
        if (data?.errors) {
          setErrors(data?.errors);
          return;
        }
      }
    },
  });

  useModalToggleListener(isOpen, () => {
    if (!isOpen) {
      removeErrors();
      resetForm();
      return;
    }
    setForm(formData);
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>Edit Classification</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <CustomInput
              label="Name"
              name="name"
              onChange={handleFormInput}
              value={form.name}
              error={errors?.name}
            />
          </div>
          <div className="pb-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              className="resize-none"
              onChange={handleFormInput}
              value={form.description}
            />
            <FieldError error={errors?.description} />
          </div>
          <div className="pb-2">
            <CustomInput
              label="Amount"
              name="amount"
              onChange={handleFormInput}
              value={form.amount}
              error={errors?.amount}
            ></CustomInput>
          </div>
          <div>
            <Button color="primary" type="submit">
              <div className="flex gap-2 items-center">
                <FaSave />
                Save
              </div>
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditPenaltyClassModal;
