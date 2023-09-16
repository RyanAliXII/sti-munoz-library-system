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

type borrowStatusesStruct struct{
	Returned string
	Cancelled string
	Unreturned string
 }

var BorrowStatuses = borrowStatusesStruct {
	Returned: "returned",
	Cancelled: "cancelled",
	Unreturned: "unreturned",
 
}
const (
	BorrowStatusPending = 1
	BorrowStatusApproved = 2
	BorrowStatusCheckedOut = 3
	BorrowStatusReturned = 4
	BorrowStatusCancelled = 5
	BorrowStatusUnreturned = 6
)
