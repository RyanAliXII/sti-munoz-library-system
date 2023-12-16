package model

import (
	"database/sql/driver"
	"encoding/json"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)

type ReportData struct{
	WalkIns int `json:"walkIns" db:"walk_ins"`
	AverageWalkIns int `json:"averageWalkIns" db:"avg_walk_ins"`
	BorrowedBooks int `json:"borrowedBooks" db:"borrowed_books"`
	UnreturnedBooks int `json:"unreturnedBooks" db:"unreturned_books"`

}

type DeviceLogReport struct {
	Client AccountJSON `json:"client" db:"client"`
	Device DeviceJSON	`json:"device" db:"device"`
	EventTime db.NullableTime `json:"eventTime" db:"event_time"`
}

func (d * DeviceLogReport)GetReadableDate() string{
	layout := "January 02, 2006 03:04 PM"
	return d.EventTime.Format(layout)
}

type ClientStatsData struct {
	WalkIns int `json:"walkIns" db:"walk_ins"`
	AverageWalkIns int `json:"averageWalkIns" db:"avg_walk_ins"`
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

