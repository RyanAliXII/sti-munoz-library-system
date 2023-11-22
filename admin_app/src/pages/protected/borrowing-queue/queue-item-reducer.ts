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
  const currentPosition = payload.move?.currentPosition ?? 0;
  const item = payload?.move?.item;
  switch (type) {
    case "initialize":
      return [...(payload.multiple ?? [])];
    case "move-up":
      if (currentPosition === 0 || !item) return state;
      return moveUp(currentPosition, item, state);
    case "move-down":
      if (currentPosition + 1 === state.length || !item) return state;
      return moveDown(currentPosition, item, state);
    default:
      return state;
  }
};
const moveUp = (
  currentPosition: number,
  item: BorrowingQueueItem,
  state: BorrowingQueueItem[]
) => {
  const newState = [...state];
  const newPositionIdx = currentPosition - 1;
  const temp = newState[newPositionIdx];
  newState[newPositionIdx] = item;
  newState[currentPosition] = temp;
  return newState;
};

const moveDown = (
  currentPosition: number,
  item: BorrowingQueueItem,
  state: BorrowingQueueItem[]
) => {
  const newState = [...state];
  const newPositionIdx = currentPosition + 1;
  const temp = newState[newPositionIdx];
  newState[newPositionIdx] = item;
  newState[currentPosition] = temp;
  return newState;
};
