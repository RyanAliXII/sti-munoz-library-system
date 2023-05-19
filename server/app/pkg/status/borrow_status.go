package status

 type onlineBorrowStatusesStruct struct{
	Pending string
	Approved string
	CheckedOut string
	Returned string
	Rejected string
	Cancelled string
 }

var OnlineBorrowStatuses = onlineBorrowStatusesStruct {
	Pending: "pending",
	Approved: "approved",
	CheckedOut: "checked-out",
	Returned: "returned",
	Rejected: "rejected",
	Cancelled: "cancelled",
}
