import TableContainer from "@components/ui/table/TableContainer";
import { Button, Table } from "flowbite-react";
import {
  useActiveQueues,
  useDequeueActive,
} from "@hooks/data-fetching/borrowing-queue";
import { Link } from "react-router-dom";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { useSwitch } from "@hooks/useToggle";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import HasAccess from "@components/auth/HasAccess";
const ActiveQueuesTable = () => {
  const { data } = useActiveQueues({});
  const [bookId, setBookId] = useState("");
  const {
    close: closeDequeueConfirmDialog,
    isOpen: isDequeueConfirmOpen,
    open: openDequeueConfirm,
  } = useSwitch();
  const queryClient = useQueryClient();
  const dequeue = useDequeueActive({
    onSuccess: () => {
      queryClient.invalidateQueries(["queues"]);
    },
    onError: () => {
      toast.error("Unknown error occurred.");
    },
    onSettled: () => {
      closeDequeueConfirmDialog();
    },
  });

  const onConfirmDequeue = () => {
    dequeue.mutate({ bookId });
  };
  const initDequeue = (bookId: string) => {
    setBookId(bookId);
    openDequeueConfirm();
  };

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
            {data?.queues.map((queue, idx) => {
              return (
                <Table.Row key={queue.book.title + idx}>
                  <Table.Cell>{queue.book.title}</Table.Cell>
                  <Table.Cell>{queue.items}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button
                        color="primary"
                        to={`/borrowing/queues/${queue.book.id}`}
                        as={Link}
                      >
                        View
                      </Button>

                      <HasAccess requiredPermissions={["Queue.Delete"]}>
                        <Button
                          disabled={dequeue.isLoading}
                          color="failure"
                          onClick={() => {
                            initDequeue(queue.book.id ?? "");
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
      </TableContainer>
      <DangerConfirmDialog
        title="Remove Queue"
        text="Are you sure you want to remove this queue? This action is irreversible."
        onConfirm={onConfirmDequeue}
        close={closeDequeueConfirmDialog}
        isOpen={isDequeueConfirmOpen}
      />
    </div>
  );
};

export default ActiveQueuesTable;
