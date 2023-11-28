import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { toReadableDatetime } from "@helpers/datetime";
import { useQueueHistory } from "@hooks/data-fetching/borrowing-queue";
import { Table } from "flowbite-react";

const QueueHistory = () => {
  const { data } = useQueueHistory({
    queryKey: ["queueHistory"],
  });
  return (
    <TableContainer>
      <Table>
        <Table.Head>
          <Table.HeadCell>Book</Table.HeadCell>
          <Table.HeadCell>Client</Table.HeadCell>
          <Table.HeadCell>Queued At</Table.HeadCell>
          <Table.HeadCell>Dequeued At</Table.HeadCell>
        </Table.Head>

        <Table.Body className="divide-y dark:divide-gray-700">
          {data?.items?.map((item) => {
            const account = item.client;
            const name =
              account.givenName.length + account.surname.length === 0
                ? "Unnamed"
                : `${account.givenName} ${account.surname}`;
            return (
              <Table.Row key={item.id}>
                <Table.Cell>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {item.book.title}
                  </div>
                  <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {item.book.section.name}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {name}
                  </div>
                  <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {account.email}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {toReadableDatetime(item.createdAt ?? "")}
                </Table.Cell>
                <Table.Cell>
                  {toReadableDatetime(item.dequeuedAt ?? "")}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </TableContainer>
  );
};

export default QueueHistory;
