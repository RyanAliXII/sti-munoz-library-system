import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useQueueItems } from "@hooks/data-fetching/borrowing-queue";
import { Button, Table } from "flowbite-react";
import ordinal from "ordinal";
import { useParams } from "react-router-dom";
import { FaArrowDown, FaArrowUp, FaSave } from "react-icons/fa";
import Tippy from "@tippyjs/react";
import { useReducer } from "react";
import { queueItemReducer } from "./queue-item-reducer";
import { BorrowingQueueItem } from "@definitions/types";

const ActiveQueueItems = () => {
  const [items, dispatch] = useReducer(queueItemReducer, []);
  const { bookId } = useParams();
  const { data } = useQueueItems({
    queryKey: ["queueItems", bookId],
    onSuccess: (data) => {
      dispatch({
        payload: {
          multiple: data?.items ?? [],
        },
        type: "initialize",
      });
    },
  });
  const moveUp = (currentPosition: number, item: BorrowingQueueItem) => {};
  const moveDown = (currentPosition: number, item: BorrowingQueueItem) => {};
  return (
    <Container>
      <div className="py-5">
        <Button color="primary">
          <div className="flex  items-center gap-1">
            <FaSave />
            <span> Save</span>
          </div>
        </Button>
      </div>
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
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {item.book.title}
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
                      <Tippy content="Move Up">
                        <Button color="primary" outline>
                          <FaArrowUp />
                        </Button>
                      </Tippy>
                      <Tippy content="Move Down">
                        <Button color="primary" outline>
                          <FaArrowDown />
                        </Button>
                      </Tippy>
                      <Button color="failure">Remove</Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ActiveQueueItems;
