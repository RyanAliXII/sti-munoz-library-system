import { toReadableDatetime } from "@helpers/datetime";
import { useQueueHistory } from "@hooks/data-fetching/borrowing-queue";
import {Table} from "flowbite-react"
const QueueHistoryTable = () => {
  const { data: items } = useQueueHistory({
    queryKey: ["queueHistory"],
  });
  return (
    <div className="overflow-x-auto mt-4">
      <Table className="table w-full">
        <Table.Head>
            <Table.HeadCell>Book</Table.HeadCell>
            <Table.HeadCell>Queued At</Table.HeadCell>
            <Table.HeadCell>Dequeued At</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y dark:divide-gray-700">
          {items?.map((item) => {
            return (
              <Table.Row key={item.id}>
                <Table.Cell>
                  <div className="font-semibold">{item.book.title}</div>
                  <div className="text-sm">{item.book.section.name}</div>
                </Table.Cell>
                <Table.Cell>{toReadableDatetime(item.createdAt ?? "")}</Table.Cell>
                <Table.Cell>{toReadableDatetime(item.dequeuedAt ?? "")}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};

export default QueueHistoryTable;
