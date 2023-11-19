import Container from "@components/ui/container/Container";
import { BorrowingQueueItem } from "@definitions/types";
import {
  useQueueItems,
  useQueueItemsUpdate,
} from "@hooks/data-fetching/borrowing-queue";
import { Button } from "flowbite-react";
import { useMemo, useReducer } from "react";
import { FaSave } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { queueItemReducer } from "./queue-item-reducer";
import ActiveQueueItemsTable from "./ActiveQueueItemsTable";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const ActiveQueueItems = () => {
  const [items, dispatch] = useReducer(queueItemReducer, []);
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { data } = useQueueItems({
    queryKey: ["queueItems", bookId],
    onSuccess: (data) => {
      if (!data?.items || data?.items.length === 0)
        navigate("/borrowing/queues");
      dispatch({
        payload: {
          multiple: data?.items ?? [],
        },
        type: "initialize",
      });
    },
  });
  const queryClient = useQueryClient();
  const updateQueueItems = useQueueItemsUpdate({
    onSuccess: () => {
      toast.success("Queue items updated.");
      queryClient.invalidateQueries(["queueItems"]);
    },
  });
  const hashedQueueItems = useMemo(
    () => data?.items.reduce<string>((a, d) => a + d.id, ""),
    [data]
  );
  const hashedReducerQueueItems = useMemo(
    () => items.reduce<string>((a, d) => a + d.id, ""),
    [items]
  );

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
  const save = () => {
    updateQueueItems.mutate({ bookId: bookId ?? "", items });
  };
  const isSaveButtonDisable = hashedQueueItems === hashedReducerQueueItems;

  return (
    <Container>
      <div className="py-5">
        <Button
          color="primary"
          onClick={save}
          isProcessing={updateQueueItems.isLoading}
          disabled={isSaveButtonDisable}
        >
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
