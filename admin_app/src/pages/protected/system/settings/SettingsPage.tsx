import { ButtonClasses } from "@components/ui/button/Button";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { Settings } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
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
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold">App Settings</h1>
      </ContainerNoBackground>
      <Container>
        {
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Setting</Th>
                <Th>Description</Th>
                <Th>Value</Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {Object.values(settings ?? {}).map((setting) => {
                return (
                  <BodyRow key={setting.id}>
                    <Td>{setting.label}</Td>
                    <Td>{setting.description}</Td>
                    <Td>{setting.value}</Td>
                    <Td>
                      <Tippy content="Edit Setting">
                        <button
                          className={
                            ButtonClasses.SecondaryOutlineButtonClasslist
                          }
                        >
                          <AiOutlineEdit className="text-lg"></AiOutlineEdit>
                        </button>
                      </Tippy>
                    </Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        }
      </Container>
    </>
  );
};

export default SettingsPage;
