package status

 type onlineBorrowStatusesStruct struct{
	Pending string
	Approved string
	CheckedOut string
	Returned string
	Cancelled string
	Unreturned string
 }

var OnlineBorrowStatuses = onlineBorrowStatusesStruct {
	Pending: "pending",
	Approved: "approved",
	CheckedOut: "checked-out",
	Returned: "returned",
	Cancelled: "cancelled",
	Unreturned: "unreturned",
 
}



