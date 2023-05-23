export type BorrowStatus = "Returned" | "Overdue" | "Checked Out";

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
}
export type OnlineBorrowStatus =
  | "pending"
  | "approved"
  | "checked-out"
  | "returned"
  | "cancelled";

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
];

export const checkStatus = (
  returnedDateISO: string,
  dueDateIso: string
): BorrowStatus => {
  const returnedDate = new Date(returnedDateISO);
  console.log(returnedDate);
  const INVALID_YEAR = 1;
  if (
    //if returnedAt date is valid then books are already returned.
    returnedDate instanceof Date &&
    !isNaN(returnedDate.getTime()) &&
    returnedDate.getFullYear() != INVALID_YEAR
  ) {
    return BorrowStatuses.Returned;
  }
  //if not returned check due date
  const now = new Date();
  const dueDate = new Date(dueDateIso);
  if (now.setHours(0, 0, 0, 0) > dueDate.setHours(0, 0, 0, 0)) {
    return BorrowStatuses.Overdue;
  }
  return BorrowStatuses.CheckedOut;
};

export const isReturned = (returnedDateISO: string) => {
  const returnedDate = new Date(returnedDateISO);
  const INVALID_YEAR = 1;
  if (
    //if returnedAt date is valid then books are already returned.
    returnedDate instanceof Date &&
    !isNaN(returnedDate.getTime()) &&
    returnedDate.getFullYear() != INVALID_YEAR
  ) {
    return true;
  }
  return false;
};
