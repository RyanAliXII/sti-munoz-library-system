import TableContainer from "@components/ui/table/TableContainer";
import { Button, Table } from "flowbite-react";
import { useActiveQueues } from "@hooks/data-fetching/borrowing-queue";
import { Link } from "react-router-dom";
const ActiveQueuesTable = () => {
  const { data } = useActiveQueues({});
  return (
    <div>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Book title</Table.HeadCell>
            <Table.HeadCell>Items in Queue</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {data?.queues.map((queue) => {
              return (
                <Table.Row>
                  <Table.Cell>{queue.book.title}</Table.Cell>
                  <Table.Cell>{queue.items}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button
                        color="primary"
                        to={"/borrowing/queues/bookId"}
                        as={Link}
                      >
                        View
                      </Button>
                      <Button color="failure">Remove</Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ActiveQueuesTable;
