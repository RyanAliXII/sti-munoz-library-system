import ClientSearchBox from "@components/ClientSearchBox";
import CustomSelect from "@components/ui/form/CustomSelect";
import FieldError from "@components/ui/form/FieldError";
import { Account, Device, DeviceLog, ModalProps } from "@definitions/types";
import { useDeviceLog, useDevices } from "@hooks/data-fetching/device";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { SingleValue } from "react-select";
import { toast } from "react-toastify";
import { LogDeviceValidation } from "../../schema";

const NewDeviceLogModal: FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { data: devices } = useDevices({});
  const {
    setForm,
    errors,
    validate,
    removeErrors,
    removeFieldError,
    resetForm,
  } = useForm<Omit<DeviceLog, "id" | "client" | "device" | "createdAt">>({
    initialFormData: {
      accountId: "",
      deviceId: "",
    },
    schema: LogDeviceValidation,
  });
  const onSelectClient = (client: Account) => {
    const clientId = client?.id;
    removeFieldError("accountId");
    if (!clientId) return;
    setForm((prev) => ({ ...prev, accountId: clientId }));
  };
  const onSelectDevice = (value: SingleValue<Device>) => {
    if (!value) return;
    removeFieldError("deviceId");
    setForm((prev) => ({ ...prev, deviceId: value.id }));
  };
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      removeErrors();
      event.preventDefault();
      const deviceLog = await validate();
      if (!deviceLog) return;
      log.mutate(deviceLog);
    } catch (error) {
      console.error(error);
    }
  };
  const queryClient = useQueryClient();
  const log = useDeviceLog({
    onSuccess: () => {
      toast.success("Game has been logged.");
      queryClient.invalidateQueries(["deviceLogs"]);
      closeModal();
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  useModalToggleListener(isOpen, () => {
    if (!isOpen) resetForm();
  });
  return (
    <Modal onClose={closeModal} show={isOpen} size="xl" dismissible>
      <Modal.Header>New Log</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <ClientSearchBox className="w-full" setClient={onSelectClient} />
          </div>
          <FieldError error={errors?.accountId}></FieldError>
          <div className="py-2">
            <CustomSelect
              label="Device"
              options={devices}
              onChange={onSelectDevice}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option?.id?.toString() ?? ""}
            />
            <FieldError error={errors?.deviceId}></FieldError>
          </div>
          <Button color="primary" type="submit">
            <div className="flex items-center gap-1">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default NewDeviceLogModal;
