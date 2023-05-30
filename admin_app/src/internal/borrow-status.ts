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
export type BorrowStatus = "returned" | "cancelled" | "unreturned";
export const STATUSES_OPTIONS = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "checked-out",
    label: "Checked Out",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "returned",
    label: "Returned",
  },
  {
    value: "unreturned",
    label: "Unreturned",
  },
];
