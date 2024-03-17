export enum BorrowStatuses {
  Returned = "Returned",
  Overdue = "Overdue",
  CheckedOut = "Checked Out",
  Available = "Available",
}

export enum OnlineBorrowStatuses {
  Pending = "pending",
  Approved = "approved",
  CheckedOut = "checked-out",
  Returned = "returned",
  Cancelled = "cancelled",
  Unreturned = "unreturned",
}
export type OnlineBorrowStatus =
  | "pending"
  | "approved"
  | "checked-out"
  | "returned"
  | "cancelled"
  | "unreturned";
// export type BorrowStatus = "returned" | "cancelled" | "unreturned";
export const STATUSES_OPTIONS = [
  {
    value: 1,
    label: "Pending",
  },
  {
    value: 2,
    label: "Approved",
  },
  {
    value: 3,
    label: "Checked Out",
  },
  {
    value: 4,
    label: "Cancelled",
  },
  {
    value: 5,
    label: "Returned",
  },
  {
    value: 6,
    label: "Unreturned",
  },
];

export enum BorrowStatus {
  Pending = 1,
  Approved = 2,
  CheckedOut = 3,
  Returned = 4,
  Cancelled = 5,
  Unreturned = 6,
}
