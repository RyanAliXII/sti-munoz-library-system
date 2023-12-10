import HasAccess from "@components/auth/HasAccess";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import TableContainer from "@components/ui/table/TableContainer";
import { BorrowingQueueItem } from "@definitions/types";
import { useDequeueItem } from "@hooks/data-fetching/borrowing-queue";
import { useSwitch } from "@hooks/useToggle";
import { useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import ordinal from "ordinal";
import { FC, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { toast } from "react-toastify";
type QueueItemsTableProps = {
  items: BorrowingQueueItem[];
  moveUp: (currentPosition: number, item: BorrowingQueueItem) => void;
  moveDown: (currentPosition: number, item: BorrowingQueueItem) => void;
};
const ActiveQueueItemsTable: FC<QueueItemsTableProps> = ({
  items,
  moveDown,
  moveUp,
}) => {
  const queryClient = useQueryClient();
  const dequeueItem = useDequeueItem({
    onSuccess: () => {
      toast.success("Item has been removed.");
      queryClient.invalidateQueries(["queueItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
    onSettled: () => {
      closeDequeueConfirmDialog();
    },
  });
  const [itemId, setItemId] = useState("");
  const {
    close: closeDequeueConfirmDialog,
    isOpen: isDequeueConfirmOpen,
    open: openDequeueConfirm,
  } = useSwitch();
  const initDequeue = (id: string) => {
    setItemId(id);
    openDequeueConfirm();
  };
  const onConfirmDequeue = () => {
    dequeueItem.mutate({ id: itemId });
  };
  return (
    <TableContainer>
      <Table>
        <Table.Head>
          <Table.HeadCell>Book</Table.HeadCell>
          <Table.HeadCell>Client</Table.HeadCell>
          <Table.HeadCell>Position</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {items.map((item, idx) => {
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
                <Table.Cell>{ordinal(idx + 1)}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <HasAccess requiredPermissions={["Queue.Edit"]}>
                      <Tippy content="Move Up">
                        <Button
                          color="primary"
                          outline
                          onClick={() => {
                            moveUp(idx, item);
                          }}
                        >
                          <FaArrowUp />
                        </Button>
                      </Tippy>
                      <Tippy content="Move Down">
                        <Button
                          color="primary"
                          outline
                          onClick={() => {
                            moveDown(idx, item);
                          }}
                        >
                          <FaArrowDown />
                        </Button>
                      </Tippy>
                    </HasAccess>
                    <HasAccess requiredPermissions={["Queue.Delete"]}>
                      <Button
                        color="failure"
                        onClick={() => {
                          initDequeue(item.id ?? "");
                        }}
                      >
                        Remove
                      </Button>
                    </HasAccess>
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <DangerConfirmDialog
        title="Remove Queue"
        text="Are you sure you want to remove this queue? This action is irreversible."
        onConfirm={onConfirmDequeue}
        close={closeDequeueConfirmDialog}
        isOpen={isDequeueConfirmOpen}
      />
    </TableContainer>
  );
};

export default ActiveQueueItemsTable;
