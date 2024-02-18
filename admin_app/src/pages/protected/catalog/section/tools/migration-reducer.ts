import { Book } from "@definitions/types";

export type MigrationData = {
  books: Book[];
  cache: Set<string>;
};
export type MigrationReducerAction = {
  type: "Add" | "Remove" | "Clear";
  payload: {
    book?: Book;
  };
};
export const migrationReducer = (
  state: MigrationData,
  action: MigrationReducerAction
) => {
  const { type, payload } = action;
  if (type === "Add" && payload.book) {
    const books = [...state.books, payload.book];
    const cache = new Set<string>(books.map((book) => book.id ?? ""));
    return {
      books: books,
      cache: cache,
    };
  }
  if (type === "Remove" && payload.book) {
    const books = state.books.filter((b) => b.id != payload.book?.id);
    const cache = new Set<string>(books.map((book) => book.id ?? ""));
    return {
      books: books,
      cache: cache,
    };
  }
  if (type === "Clear") {
    return {
      books: [],
      cache: new Set<string>(),
    };
  }
  return state;
};
