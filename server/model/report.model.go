package model

import (
	"database/sql/driver"
	"encoding/json"
)

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
type WalkInLabel struct {
	Label string `json:"label" db:"label"`
}
type DeviceData struct {
	Name string `json:"name" db:"name"`
	Total int `json:"total" db:"total"`
}

type WalkInData struct {
	UserGroup string `json:"userGroup" db:"user_group"`
	Logs ClientLogsDataJSON `json:"logs" db:"logs"`
}
type ClientLogsDataJSON []struct {
	Date string `json:"date" db:"date"`
	Count int `json:"count" db:"count"`
}
func (ba *ClientLogsDataJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, ba)
		if unmarshalErr != nil {
			*ba = make(ClientLogsDataJSON, 0)
		}

	} else {
		*ba = make(ClientLogsDataJSON, 0)
	}
	return nil

}

func (ba ClientLogsDataJSON) Value(value interface{}) (driver.Value, error) {
	return ba, nil
}

