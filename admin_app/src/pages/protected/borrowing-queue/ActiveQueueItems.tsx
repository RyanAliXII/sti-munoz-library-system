import Container from "@components/ui/container/Container";
import { useQueueItems } from "@hooks/data-fetching/borrowing-queue";
import { Table } from "flowbite-react";
import { useParams } from "react-router-dom";

const ActiveQueueItems = () => {
  const { bookId } = useParams();
  const {} = useQueueItems({
    queryKey: ["queueItems", bookId],
  });
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
