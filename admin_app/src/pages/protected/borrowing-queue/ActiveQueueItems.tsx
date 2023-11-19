import Container from "@components/ui/container/Container";
import { Table } from "flowbite-react";

const ActiveQueueItems = () => {
  return (
    <Container>
      <Table>
        <Table.Head>
          <Table.HeadCell>Book</Table.HeadCell>
          <Table.HeadCell>Client</Table.HeadCell>
          <Table.HeadCell>Position</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body>
          <Table.Row></Table.Row>
        </Table.Body>
      </Table>
    </Container>
  );
};

export default ActiveQueueItems;
