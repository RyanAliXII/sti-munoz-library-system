export enum OnlineBorrowStatuses {
  Pending = "pending",
  Approved = "approved",
  CheckedOut = "checked-out",
  Returned = "returned",
  Cancelled = "cancelled",
}
export type OnlineBorrowStatus =
  | "pending"
  | "approved"
  | "checked-out"
  | "returned"
  | "cancelled"
  | "unreturned";

export const StatusText = {
  Pending:
    "The book that you have requested is subjected for approval. Please wait patiently.",
  Approved:
    "The book that you have requested has been approved. You can now get the book on the library.",
  CheckedOut: "The book has been handed to you by the librarian.",
  Returned: "The book has been returned.",
  Cancelled: "Book borrow request has been declined or cancelled.",
};
export enum BorrowStatus {
  Pending = 1,
  Approved = 2,
  CheckedOut = 3,
  Returned = 4,
  Cancelled = 5,
  Unreturned = 6,
}
