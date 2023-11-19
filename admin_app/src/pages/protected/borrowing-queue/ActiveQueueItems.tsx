import Container from "@components/ui/container/Container";
import { BorrowingQueueItem } from "@definitions/types";
import { useQueueItems } from "@hooks/data-fetching/borrowing-queue";
import { Button } from "flowbite-react";
import { useReducer } from "react";
import { FaSave } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { queueItemReducer } from "./queue-item-reducer";
import ActiveQueueItemsTable from "./ActiveQueueItemsTable";

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
  const moveUp = (currentPosition: number, item: BorrowingQueueItem) => {
    dispatch({
      payload: {
        move: {
          item,
          currentPosition,
        },
      },
      type: "move-up",
    });
  };
  const moveDown = (currentPosition: number, item: BorrowingQueueItem) => {
    dispatch({
      payload: {
        move: {
          item,
          currentPosition,
        },
      },
      type: "move-down",
    });
  };
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
      <ActiveQueueItemsTable
        items={items}
        moveDown={moveDown}
        moveUp={moveUp}
      />
    </Container>
  );
};

export default ActiveQueueItems;
