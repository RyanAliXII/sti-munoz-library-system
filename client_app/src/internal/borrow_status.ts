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
    "The requested book is pending approval. Thank you for your patience",
  Approved:
    "The requested book has received approval. You may now obtain it from the library.",
  CheckedOut: "The book has been handed to you by the librarian.",
  Returned: "The book has been returned.",
  Cancelled: "Book borrow request has been cancelled.",
};

export const EbookStatusText = {
  Pending:
    "The book that you have requested is subjected for approval. Please wait patiently.",
  Approved:
    "The requested book has been approved. Please await the eBook link.",
  CheckedOut: "You may now access the eBook.",
};
export enum BorrowStatus {
  Pending = 1,
  Approved = 2,
  CheckedOut = 3,
  Returned = 4,
  Cancelled = 5,
  Unreturned = 6,
}
