import CustomSelect from "@components/ui/form/CustomSelect";
import { CustomInput } from "@components/ui/form/Input";
import { ModalProps, UserProgramOrStrand, UserType } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { UserProgramValidation } from "./schema";
import { SingleValue } from "react-select";
import { useNewProgram } from "@hooks/data-fetching/user";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

interface NewUserProgramModalProps extends ModalProps {
  userTypes: UserType[];
}
const NewUserProgramModal: FC<NewUserProgramModalProps> = ({
  isOpen,
  closeModal,
  userTypes,
}) => {
  const {
    errors,
    form,
    validate,
    handleFormInput,
    removeFieldError,
    setFieldValue,
  } = useForm<Omit<UserProgramOrStrand, "id">>({
    initialFormData: {
      code: "",
      name: "",
      userTypeId: 0,
    },
    schema: UserProgramValidation,
  });
  const queryClient = useQueryClient();
  const newProgram = useNewProgram({
    onSuccess: () => {
      toast.success("Program/Strand added.");
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
      newProgram.mutate(parsed);
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };
  const handleProgramSelection = (newValue: SingleValue<UserType>) => {
    removeFieldError("userTypeId");
    setFieldValue("userTypeId", newValue?.id);
  };
  return (
    <Modal size="lg" onClose={closeModal} show={isOpen}>
      <Modal.Header>New Program or Strand</Modal.Header>
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

export default NewUserProgramModal;
