import Container from "@components/ui/container/Container";
import { Table } from "flowbite-react";

const DateSlotPage = () => {
  return (
    <Container>
      <Table>
        <Table.Head>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Time Slot Profile</Table.HeadCell>
        </Table.Head>
        <Table.Body></Table.Body>
      </Table>
    </Container>
  );
};

export default DateSlotPage;
