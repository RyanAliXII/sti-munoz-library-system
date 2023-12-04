import { CustomInput } from "@components/ui/form/Input";
import { ModalProps, UserType } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { Button, Checkbox, Label, Modal } from "flowbite-react";
import { FC } from "react";
import { FaSave } from "react-icons/fa";
import { NewUserTypeValidation } from "./schema";
const NewUserTypeModal: FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { form, handleFormInput } = useForm<UserType>({
    initialFormData: {
      name: "",
      hasProgram: false,
      id: 0,
    },
    schema: NewUserTypeValidation,
  });
  return (
    <Modal dismissible show={isOpen} onClose={closeModal} size="lg">
      <Modal.Header>New User Type</Modal.Header>
      <Modal.Body>
        <form>
          <div className="pb-2">
            <CustomInput
              label="Name"
              name="name"
              value={form.name}
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
            <Button color="primary">
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
