import { CustomInput } from "@components/ui/form/Input";
import { useEditSettings } from "@hooks/data-fetching/settings";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { number, object } from "yup";
import { InputModalProps } from "./SettingsPage";

const IntModal: FC<InputModalProps> = ({
  isOpen,
  closeModal,
  settingField,
  settings,
}) => {
  const { setFieldValue, handleFormInput, form, validate, errors } = useForm({
    initialFormData: {
      value: 0,
    },
    schema: object({
      value: number()
        .integer("Value should be integer")
        .required("Value is required")
        .typeError("Value is required."),
    }),
  });
  useModalToggleListener(isOpen, () => {
    if (!isOpen) return;
    setFieldValue("value", settingField.value);
  });
  const queryClient = useQueryClient();
  const editSettings = useEditSettings({
    onSuccess: () => {
      queryClient.invalidateQueries(["appSettings"]);
      toast.success("App settings updated.");
      closeModal();
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const sf = settings?.[settingField.id as any];
      if (!sf) return;
      const parsedForm = await validate();
      if (!parsedForm) return;
      sf.value = parsedForm.value;
      settings[settingField.id] = sf;
      editSettings.mutate(settings);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Modal show={isOpen} onClose={closeModal} size="lg" dismissible>
      <Modal.Header>{settingField.label}</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <CustomInput
              value={form.value}
              name="value"
              onChange={handleFormInput}
              error={errors?.value}
            />
          </div>
          <Button color="primary" type="submit">
            <div className="flex gap-2">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default IntModal;
