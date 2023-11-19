import { BorrowingQueueItem } from "@definitions/types";

type MovePayload = {
  currentPosition: number;
  item: BorrowingQueueItem;
};
type QueueItemsAction = {
  type: "initialize" | "move-up" | "move-down";
  payload: {
    multiple?: BorrowingQueueItem[];
    move?: MovePayload;
  };
};
export const queueItemReducer = (
  state: BorrowingQueueItem[],
  action: QueueItemsAction
) => {
  const { type, payload } = action;
  switch (type) {
    case "initialize":
      return [...(payload.multiple ?? [])];
    default:
      return state;
  }
};
