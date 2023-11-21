import Container from "@components/ui/container/Container";
import { Table } from "flowbite-react";

const TimeSlotProfile = () => {
  return (
    <Container>
      <Table>
        <Table.Head>
          <Table.HeadCell>Profile Name</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body>
          <Table.Row></Table.Row>
        </Table.Body>
      </Table>
    </Container>
  );
};

export default TimeSlotProfile;
