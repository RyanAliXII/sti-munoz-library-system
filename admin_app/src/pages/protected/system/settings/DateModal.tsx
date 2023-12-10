import React, { FC, FormEvent } from "react";
import { InputModalProps } from "./SettingsPage";
import { Button, Datepicker, Label, Modal } from "flowbite-react";
import { CustomInput } from "@components/ui/form/Input";
import { FaSave } from "react-icons/fa";
import { useForm } from "@hooks/useForm";
import { object, string } from "yup";
import { SettingsField } from "@definitions/types";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { TbSettingsFilled } from "react-icons/tb";
import { useQueryClient } from "@tanstack/react-query";
import { useEditSettings } from "@hooks/data-fetching/settings";
import { toast } from "react-toastify";
import { format, isValid, parse } from "date-fns";

const DateModal: FC<InputModalProps> = ({
  closeModal,
  isOpen,
  settingField,
  settings,
}) => {
  const { form, setFieldValue, errors, validate } = useForm({
    initialFormData: {
      value: "",
    },
    schema: object({
      value: string()
        .required("Value is required")
        .test("is-valid-date-str", "Value is required", (value) => {
          try {
            const parsedDate = parse(value ?? "", "yyyy-MM-dd", new Date());
            return isValid(parsedDate);
          } catch (error) {
            return false;
          }
        }),
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
  const handleDateSelect = (date: Date) => {
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      setFieldValue("value", dateStr);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Modal show={isOpen} onClose={closeModal} size="lg" dismissible>
      <Modal.Header>{settingField.label}</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <Label>Value</Label>
            <Datepicker
              value={form.value}
              onSelectedDateChanged={handleDateSelect}
            />
            <div className="h-2 flex items-center mt-2">
              <small className="text-red-500">{errors?.value}</small>
            </div>
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

export default DateModal;
