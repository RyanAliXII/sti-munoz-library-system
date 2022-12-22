package model

import (
	"database/sql/driver"
	"time"
)

type NullTimeCustom struct {
	Time  time.Time `json:"time"`
	Valid bool      `json:"valid"`
} // Scan implements the Scanner interface.
func (nt *NullTimeCustom) Scan(value interface{}) error {
	nt.Time, nt.Valid = value.(time.Time)
	return nil
}
func (nt *NullTimeCustom) Value() (driver.Value, error) {
	if !nt.Valid {
		return nil, nil
	}
	return nt.Time, nil
}
