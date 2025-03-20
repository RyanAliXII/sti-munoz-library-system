package model

type LibraryStats struct {
	Accounts int `json:"accounts" db:"accounts"`
	Books int `json:"books" db:"books"`
	Penalties float64 `json:"penalties" db:"penalties"`
	SettledPenalties float64 `json:"settledPenalties" db:"settled_penalties"`
	UnsettledPenalties float64 `json:"unsettledPenalties" db:"unsettled_penalties"`
	PendingBooks int `json:"pendingBooks" db:"pending_books"`
	ApprovedBooks int `json:"approvedBooks" db:"approved_books"`
	CheckedOutBooks int `json:"checkedOutBooks" db:"checked_out_books"`
	ReturnedBooks int `json:"returnedBooks" db:"returned_books"`
	UnreturnedBooks int `json:"unreturnedBooks" db:"unreturned_books"`
	CancelledBooks int `json:"cancelledBooks" db:"cancelled_books"`
	WeeklyWalkIns []WalkInData `json:"weeklyWalkIns" db:"weekly_walk_ins"`
	MonthlyWalkIns []WalkInData `json:"monthlyWalkIns" db:"monthly_walk_ins"`
	MonthlyBorrowedSection []BorrowedSection `json:"monthlyBorrowedSections" db:"monthly_borrowed_section"`
	WeeklyBorrowedSection []BorrowedSection `json:"weeklyBorrowedSections" db:"weekly_borrowed_section"`
}


type WalkInLog struct {
	Date string `json:"date" db:"date"`
	WalkIns int `json:"walkIns" db:"walk_ins"`
}

type BorrowedSection struct {
	Total int `json:"total" db:"total"`
	Name string `json:"name" db:"name"`
}