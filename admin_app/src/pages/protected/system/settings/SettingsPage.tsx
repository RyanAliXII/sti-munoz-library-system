import Container from "@components/ui/container/Container";
import { ModalProps, Settings, SettingsField } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { AiOutlineEdit } from "react-icons/ai";
import IntModal from "./IntModal";

export interface InputModalProps extends ModalProps {
  label?: string;
  value: number | string;
}
const SettingsPage = () => {
  const { Get } = useRequest();
  const fetchAppSettings = async () => {
    try {
      const response = await Get("/system/settings", {}, []);
      const { data } = response.data;
      console.log(data);
      return data?.settings;
    } catch (error) {
      return {
        settings: {
          value: {},
        },
      };
    }
  };
  const { data: settings } = useQuery<Settings>({
    queryFn: fetchAppSettings,
    queryKey: ["appSettings"],
  });

  const intModal = useSwitch();

  const initEdit = (field: SettingsField) => {
    if (field.type === "int") {
      intModal.open();
    }
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
              {Object.values(settings ?? {}).map((setting) => {
                return (
                  <Table.Row key={setting.id}>
                    <Table.Cell>{setting.label}</Table.Cell>
                    <Table.Cell>{setting.description}</Table.Cell>
                    <Table.Cell>{setting.value}</Table.Cell>
                    <Table.Cell>
                      <Tippy content="Edit Setting">
                        <Button
                          color="secondary"
                          onClick={() => {
                            initEdit(setting);
                          }}
                        >
                          <AiOutlineEdit className="text-lg"></AiOutlineEdit>
                        </Button>
                      </Tippy>
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
          value={1}
        />
      </Container>
    </>
  );
};

export default SettingsPage;
