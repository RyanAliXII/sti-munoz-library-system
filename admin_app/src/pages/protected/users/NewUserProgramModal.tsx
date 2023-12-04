import CustomSelect from "@components/ui/form/CustomSelect";
import { CustomInput } from "@components/ui/form/Input";
import { ModalProps, UserType } from "@definitions/types";
import { Button, Modal } from "flowbite-react";
import { FC } from "react";
import { FaSave } from "react-icons/fa";

interface NewUserProgramModalProps extends ModalProps {
  userTypes: UserType[];
}
const NewUserProgramModal: FC<NewUserProgramModalProps> = ({
  isOpen,
  closeModal,
  userTypes,
}) => {
  return (
    <Modal size="lg" onClose={closeModal} show={isOpen}>
      <Modal.Header>New Program or Strand</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form>
          <div className="pb-2">
            <CustomInput name="code" label="Code" />
          </div>
          <div className="pb-2">
            <CustomInput name="name" label="Name" />
          </div>
          <div className="pb-2">
            <CustomSelect
              name="userTypeId"
              options={userTypes}
              getOptionLabel={(t) => t.name}
              getOptionValue={(t) => t.id.toString()}
              onChange={() => {}}
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
