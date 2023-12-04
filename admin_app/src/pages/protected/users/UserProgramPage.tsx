import Container from "@components/ui/container/Container";
import { useUserPrograms } from "@hooks/data-fetching/user";
import { Table } from "flowbite-react";

const UserProgramPage = () => {
  const { data: programs } = useUserPrograms({});

  return (
    <Container>
      <Table>
        <Table.Head>
          <Table.HeadCell>Code</Table.HeadCell>
          <Table.HeadCell>Program/Strand Name</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y dark:divide-gray-700">
          {programs?.map((program) => {
            return (
              <Table.Row>
                <Table.Cell>{program.code}</Table.Cell>
                <Table.Cell>{program.name}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </Container>
  );
};

export default UserProgramPage;
