import { Book } from "@definitions/types";

type BookSelectionReducerState = {
  books: Map<string, Book>;
};
type BookSelectionAction = {
  type: "select" | "unselect";
  payload: {
    single?: Book;
  };
};
export const bookSelectionReducer = (
  state: BookSelectionReducerState,
  action: BookSelectionAction
) => {
  const { type, payload } = action;

  if (type === "select" && payload.single) {
    const newMap = new Map<string, Book>(state.books);
    newMap.set(payload.single?.id ?? "", payload.single);
    return {
      books: newMap,
    };
  }
  if (type === "unselect" && payload.single) {
    const newMap = new Map<string, Book>(state.books);
    newMap.delete(payload.single.id ?? "");
    return {
      books: newMap,
    };
  }
  return state;
};
