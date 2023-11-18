import TableContainer from "@components/ui/table/TableContainer";
import { Table } from "flowbite-react";
import React from "react";

const ActiveQueuesTable = () => {
  return (
    <div>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Book title</Table.HeadCell>
            <Table.HeadCell>Items in Queue</Table.HeadCell>
          </Table.Head>
          <Table.Body></Table.Body>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ActiveQueuesTable;
