import Container from "@components/ui/container/Container";
import { Table } from "flowbite-react";

const UserTypePage = () => {
  return (
    <Container>
      <Table>
        <Table.Head>
          <Table.HeadCell>Id</Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
        </Table.Head>
        <Table.Body></Table.Body>
      </Table>
    </Container>
  );
};

export default UserTypePage;
