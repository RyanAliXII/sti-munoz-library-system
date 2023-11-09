import { ButtonClasses } from "@components/ui/button/Button";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { Settings } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { AiOutlineEdit } from "react-icons/ai";

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
                        <Button color="secondary">
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
      </Container>
    </>
  );
};

export default SettingsPage;
