import { CustomInput } from "@components/ui/form/Input";
import { Device, ModalProps } from "@definitions/types";
import { useEditDevice, useNewDevice } from "@hooks/data-fetching/device";
import { useForm } from "@hooks/useForm";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { DeviceValidation } from "../schema";
import FieldError from "@components/ui/form/FieldError";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { EditModalProps } from "@pages/protected/system/access-control/EditRoleModal";

const EditDeviceModal: FC<EditModalProps<Device>> = ({
  closeModal,
  isOpen,
  formData,
}) => {
  const queryClient = useQueryClient();
  const updateDevice = useEditDevice({
    onSuccess: () => {
      toast.success("Device has been updated.");
      queryClient.invalidateQueries(["devices"]);
      closeModal();
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const { handleFormInput, validate, errors, setForm, form } = useForm<Device>({
    initialFormData: {
      id: "",
      description: "",
      name: "",
      available: 0,
    },
    schema: DeviceValidation,
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const device = await validate();
      if (!device) return;
      updateDevice.mutate(device);
    } catch (err) {
      console.error(err);
    }
  };
  useModalToggleListener(isOpen, () => {
    if (!isOpen) return;
    setForm(formData);
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="xl">
      <Modal.Header>Edit Device</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <CustomInput
              label="Name"
              value={form.name}
              error={errors?.name}
              name="name"
              onChange={handleFormInput}
            />
          </div>
          <div className="py-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={handleFormInput}
              name="description"
              className="resize-none"
            />
            <FieldError error={errors?.description} />
          </div>
          <div className="py-2">
            <CustomInput
              value={form.available}
              label="Available Devices"
              error={errors?.available}
              type="number"
              name="available"
              onChange={handleFormInput}
            />
          </div>
          <Button
            color="primary"
            type="submit"
            isProcessing={updateDevice.isLoading}
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

export default EditDeviceModal;
