import Container from "@components/ui/container/Container";
import { Table } from "flowbite-react";

const UserProgramPage = () => {
  return (
    <Container>
      <Table>
        <Table.Head>
          <Table.HeadCell>Code</Table.HeadCell>
          <Table.HeadCell>Program/Strand Name</Table.HeadCell>
        </Table.Head>
        <Table.Body> </Table.Body>
      </Table>
    </Container>
  );
};

export default UserProgramPage;
