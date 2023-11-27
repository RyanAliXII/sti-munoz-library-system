import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { BookInitialValue } from "@definitions/defaults";
import { BorrowingQueue } from "@definitions/types";
import { toReadableDatetime } from "@helpers/datetime";
import { useDequeueItem } from "@hooks/data-fetching/borrowing-queue";
import { useSwitch } from "@hooks/useToggle";
import { useQueryClient } from "@tanstack/react-query";
import React, { FC, useState } from "react";
import { toast } from "react-toastify";

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
      <table className="table w-full">
        <thead>
          <tr>
            <th>Book</th>
            <th>Queued At</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {queues.map((item) => {
            return (
              <tr key={item.id}>
                <td>
                  <div className="font-semibold">{item.book.title}</div>
                  <div className="text-sm">{item.book.section.name}</div>
                </td>
                <td>{toReadableDatetime(item.createdAt ?? "")}</td>
                <td>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => {
                      initCancellation(item);
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
