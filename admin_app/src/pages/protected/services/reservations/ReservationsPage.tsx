import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { Table } from "flowbite-react";
import React from "react";

const ReservationsPage = () => {
  return (
    <Container>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Client</Table.HeadCell>
            <Table.HeadCell>Device</Table.HeadCell>
            <Table.HeadCell>Datetime</Table.HeadCell>
          </Table.Head>
          <Table.Body></Table.Body>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ReservationsPage;
