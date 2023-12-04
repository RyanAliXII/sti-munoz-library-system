import { CustomInput } from "@components/ui/form/Input";
import { ModalProps, UserType } from "@definitions/types";
import { useNewUserType } from "@hooks/data-fetching/user";
import { useForm } from "@hooks/useForm";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, Label, Modal } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { NewUserTypeValidation } from "./schema";
const NewUserTypeModal: FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { form, handleFormInput, validate, errors } = useForm<
    Omit<UserType, "id">
  >({
    initialFormData: {
      name: "",
      hasProgram: false,
    },
    schema: NewUserTypeValidation,
  });
  const queryClient = useQueryClient();
  const newUserType = useNewUserType({
    onSuccess: () => {
      toast.success("User type added.");
      queryClient.invalidateQueries(["userTypes"]);
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
      closeModal();
      newUserType.mutate(parsed);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Modal dismissible show={isOpen} onClose={closeModal} size="lg">
      <Modal.Header>New User Type</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <CustomInput
              label="Name"
              name="name"
              value={form.name}
              error={errors?.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="pb-2 flex gap-2 items-center">
            <Label>Has program or strand</Label>
            <Checkbox
              checked={form.hasProgram}
              color="primary"
              name="hasProgram"
              onChange={handleFormInput}
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

export default NewUserTypeModal;
