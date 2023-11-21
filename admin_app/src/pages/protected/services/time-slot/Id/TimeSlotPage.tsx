import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { Table } from "flowbite-react";
import React from "react";

const TimeSlotPage = () => {
  return (
    <Container>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>From</Table.HeadCell>
            <Table.HeadCell>To</Table.HeadCell>
          </Table.Head>
          <Table.Body></Table.Body>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TimeSlotPage;
