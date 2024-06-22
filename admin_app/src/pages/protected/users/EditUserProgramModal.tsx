import CustomSelect from "@components/ui/form/CustomSelect";
import { CustomInput } from "@components/ui/form/Input";
import {
  EditModalProps,
  ModalProps,
  UserProgramOrStrand,
  UserType,
} from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { UserProgramValidation } from "./schema";
import { SingleValue } from "react-select";
import { useEditProgram, useNewProgram } from "@hooks/data-fetching/user";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import useModalToggleListener from "@hooks/useModalToggleListener";

interface EditUserProgramModalProps
  extends EditModalProps<UserProgramOrStrand> {
  userTypes: UserType[];
}
export const EditUserProgramModal: FC<EditUserProgramModalProps> = ({
  isOpen,
  closeModal,
  userTypes,
  formData,
}) => {
  const {
    errors,
    form,
    setForm,
    validate,
    handleFormInput,
    removeFieldError,
    setFieldValue,
  } = useForm<UserProgramOrStrand>({
    initialFormData: {
      id: 0,
      code: "",
      name: "",
      userTypeId: 0,
      userType: {
        hasProgram: false,
        maxUniqueDeviceReservationPerDay: 0,
        id: 0,
        name: "",
        maxAllowedBorrowedBooks: 0,
      },
    },
    schema: UserProgramValidation,
  });
  const queryClient = useQueryClient();
  const editProgram = useEditProgram({
    onSuccess: () => {
      toast.success("Program/Strand updated.");
      queryClient.invalidateQueries(["userPrograms"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const parsed = await validate();
      if (!parsed) return;
      editProgram.mutate(parsed);
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };
  const handleProgramSelection = (newValue: SingleValue<UserType>) => {
    removeFieldError("userTypeId");
    setFieldValue("userType", newValue);
    setFieldValue("userTypeId", newValue?.id);
  };

  useModalToggleListener(isOpen, () => {
    if (!isOpen) return;
    setForm(formData);
  });
  return (
    <Modal size="lg" onClose={closeModal} show={isOpen} dismissible>
      <Modal.Header>Edit Program/Strand</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <CustomInput
              name="code"
              label="Code"
              error={errors?.code}
              value={form.code}
              onChange={handleFormInput}
            />
          </div>
          <div className="pb-2">
            <CustomInput
              name="name"
              label="Name"
              error={errors?.name}
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="pb-2">
            <CustomSelect
              value={form.userType}
              error={errors?.userTypeId}
              label="User type"
              name="userTypeId"
              options={userTypes}
              getOptionLabel={(t) => t.name}
              getOptionValue={(t) => t.id.toString()}
              onChange={handleProgramSelection}
            />
          </div>
          <div className="py-2">
            <Button color="primary" type="submit">
              <div className="flex items-center gap-2">
                <FaSave /> Save
              </div>
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditUserProgramModal;
