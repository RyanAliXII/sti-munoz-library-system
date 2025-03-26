import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { BorrowingQueue } from "@definitions/types";
import { toReadableDatetime } from "@helpers/datetime";
import { useDequeueItem } from "@hooks/data-fetching/borrowing-queue";
import { useSwitch } from "@hooks/useToggle";
import { useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import {Button, Table} from "flowbite-react"
type OngoingQueueTableProps = {
  queues: BorrowingQueue[];
};
const OngoingQueueTable: FC<OngoingQueueTableProps> = ({ queues }) => {
  const [item, setItem] = useState<
    Omit<BorrowingQueue, "account" | "accountId" | "book">
  >({
    id: "",
    bookId: "",
  });
  const cancelQueue = useSwitch();
  const initCancellation = (queue: BorrowingQueue) => {
    setItem(queue);
    cancelQueue.open();
  };
  const queryClient = useQueryClient();
  const cancel = useDequeueItem({
    onSuccess: () => {
      toast.success("Book has been removed from queue.");
      queryClient.invalidateQueries(["queues", "queueHistory"]);
    },
    onError: () => {
      toast.success("Unknown error occured.");
    },
  });
  const onConfirmCancel = () => {
    cancelQueue.close();
    cancel.mutate(item.id ?? "");
  };
  return (
    <div className="overflow-x-auto mt-4">
      <Table>
        <Table.Head>
            <Table.HeadCell>Book</Table.HeadCell>
            <Table.HeadCell>Queued At</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y dark:divide-gray-700">
          {queues.map((item) => {
            return (
              <Table.Row key={item.id}>
                <Table.Cell>
                  <div className="font-semibold">{item.book.title}</div>
                  <div className="text-sm">{item.book.section.name}</div>
                </Table.Cell>
                <Table.Cell>{toReadableDatetime(item.createdAt ?? "")}</Table.Cell>
                <Table.Cell>
                  <Button
                    color="failure"
                    size="sm"
                    onClick={() => {
                      initCancellation(item);
                    }}
                  >
                    Cancel
                  </Button>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      <DangerConfirmDialog
        close={cancelQueue.close}
        isOpen={cancelQueue.isOpen}
        onConfirm={onConfirmCancel}
        text="Are you sure you want to remove book from queue?"
        title="Remove Book From Queue"
      />
    </div>
  );
};

export default OngoingQueueTable;
