import { CustomInput } from "@components/ui/form/Input";
import { Device, ModalProps } from "@definitions/types";
import { useNewDevice } from "@hooks/data-fetching/device";
import { useForm } from "@hooks/useForm";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { DeviceValidation } from "../schema";
import FieldError from "@components/ui/form/FieldError";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import useModalToggleListener from "@hooks/useModalToggleListener";

const NewDeviceModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const queryClient = useQueryClient();
  const newDevice = useNewDevice({
    onSuccess: () => {
      toast.success("New device has been added.");
      queryClient.invalidateQueries(["devices"]);
      closeModal();
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const { handleFormInput, validate, errors, resetForm } = useForm<
    Omit<Device, "id">
  >({
    initialFormData: {
      description: "",
      name: "",
    },
    schema: DeviceValidation,
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const device = await validate();
      if (!device) return;
      newDevice.mutate(device);
    } catch (err) {
      console.error(err);
    }
  };
  useModalToggleListener(isOpen, () => {
    if (!isOpen) resetForm();
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="xl">
      <Modal.Header>New Device</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <CustomInput
              label="Name"
              error={errors?.name}
              name="name"
              onChange={handleFormInput}
            />
          </div>
          <div className="py-2">
            <Label>Description</Label>
            <Textarea
              onChange={handleFormInput}
              name="description"
              className="resize-none"
            />
            <FieldError error={errors?.description} />
          </div>

          <Button
            color="primary"
            type="submit"
            isProcessing={newDevice.isLoading}
          >
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

export default NewDeviceModal;
