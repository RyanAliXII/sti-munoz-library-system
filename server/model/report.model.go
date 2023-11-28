package model

type ReportData struct{
	WalkIns int `json:"walkIns" db:"walk_ins"`
	AverageWalkIns int `json:"averageWalkIns" db:"avg_walk_ins"`
	BorrowedBooks int `json:"borrowedBooks" db:"borrowed_books"`
	UnreturnedBooks int `json:"unreturnedBooks" db:"unreturned_books"`

}

type GameData struct {
	Name string `json:"name" db:"name"`
	Total int `json:"total" db:"total"`
}

type DeviceData struct {
	Name string `json:"name" db:"name"`
	Total int `json:"total" db:"total"`
}