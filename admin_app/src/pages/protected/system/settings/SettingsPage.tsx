import Container from "@components/ui/container/Container";
import { ModalProps, Settings, SettingsField } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { AiOutlineEdit } from "react-icons/ai";
import IntModal from "./IntModal";
import DateModal from "./DateModal";
import { useState } from "react";
import { WarningConfirmDialog } from "@components/ui/dialog/Dialog";
import { MdRestartAlt } from "react-icons/md";
import { useEditSettings } from "@hooks/data-fetching/settings";
import { toast } from "react-toastify";

export interface InputModalProps extends ModalProps {
  label?: string;
  settingField: SettingsField;
  settings: Settings | undefined;
}
const SettingsPage = () => {
  const { Get } = useRequest();
  const [settingField, setSettingField] = useState<SettingsField>({
    description: "",
    id: "",
    label: "",
    type: "string",
    value: 0,
    defaultValue: 0,
  });
  const fetchAppSettings = async () => {
    try {
      const response = await Get("/system/settings", {}, []);
      const { data } = response.data;
      return data?.settings ?? {};
    } catch (error) {
      return {};
    }
  };
  const { data: settings } = useQuery<Settings>({
    queryFn: fetchAppSettings,
    queryKey: ["appSettings"],
  });

  const intModal = useSwitch();
  const dateModal = useSwitch();
  const initEdit = (field: SettingsField) => {
    setSettingField(field);
    if (field.type === "int") {
      intModal.open();
    }
    if (field.type === "date") {
      dateModal.open();
    }
  };
  const resetDialog = useSwitch();
  const initReset = (field: SettingsField) => {
    setSettingField(field);
    resetDialog.open();
  };
  const queryClient = useQueryClient();
  const editSettings = useEditSettings({
    onSuccess: () => {
      toast.success("Setting field has been reset.");
      queryClient.invalidateQueries(["appSettings"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onConfirmReset = () => {
    resetDialog.close();
    if (!settings) return;
    const s = settings;
    const field = settingField;
    field.value = settingField.defaultValue;
    s[field.id] = settingField;
    editSettings.mutate(s);
  };

  return (
    <>
      <Container>
        {
          <Table>
            <Table.Head>
              <Table.HeadCell>Setting</Table.HeadCell>
              <Table.HeadCell>Description</Table.HeadCell>
              <Table.HeadCell>Value</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y dark:divide-gray-700">
              {Object.values(settings ?? {})?.map((setting) => {
                return (
                  <Table.Row key={setting.id}>
                    <Table.Cell>{setting.label}</Table.Cell>
                    <Table.Cell>{setting.description}</Table.Cell>
                    <Table.Cell>{setting.value}</Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Tippy content="Edit Setting">
                          <Button
                            color="primary"
                            onClick={() => {
                              initEdit(setting);
                            }}
                          >
                            <AiOutlineEdit className="text-lg" />
                          </Button>
                        </Tippy>

                        {setting.defaultValue != setting.value && (
                          <Tippy content="Reset to Default">
                            <Button
                              color="warning"
                              onClick={() => {
                                initReset(setting);
                              }}
                            >
                              <MdRestartAlt className="text-lg" />
                            </Button>
                          </Tippy>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        }
        <IntModal
          closeModal={intModal.close}
          isOpen={intModal.isOpen}
          settings={settings}
          settingField={settingField}
        />
        <DateModal
          closeModal={dateModal.close}
          isOpen={dateModal.isOpen}
          settings={settings}
          settingField={settingField}
        />
        <WarningConfirmDialog
          close={resetDialog.close}
          isOpen={resetDialog.isOpen}
          title={`Reset to Default`}
          text={`Are you sure you want to reset ${settingField.label}?`}
          onConfirm={onConfirmReset}
        />
      </Container>
    </>
  );
};

export default SettingsPage;
