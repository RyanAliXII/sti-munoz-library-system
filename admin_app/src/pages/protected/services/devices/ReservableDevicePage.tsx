import Container from "@components/ui/container/Container";
import { Table } from "flowbite-react";

const ReservableDevicePage = () => {
  return (
    <Container>
      <Table>
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Description</Table.HeadCell>
          <Table.HeadCell>Available Device</Table.HeadCell>
        </Table.Head>
        <Table.Body></Table.Body>
      </Table>
    </Container>
  );
};

export default ReservableDevicePage;
