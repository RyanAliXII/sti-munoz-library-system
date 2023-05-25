package db

import (
	"database/sql/driver"
	"fmt"
	"strconv"
	"time"
)

// type NullableTime struct {
// 	Time  time.Time `json:"time"`
// 	Valid bool      `json:"valid"`
// }

// func (nt *NullableTime) Scan(value interface{}) error {
// 	nt.Time, nt.Valid = value.(time.Time)
// 	return nil
// }
// func (nt *NullableTime) Value() (driver.Value, error) {
// 	if !nt.Valid {
// 		return nil, nil
// 	}
// 	return nt.Time, nil
// }

// type NullableString string

// func (ns *NullableString) Scan(value interface{}) error {
// 	parsedVal, valid := value.(string)
// 	if valid {
// 		*ns = NullableString(parsedVal)

// 		return nil
// 	}
// 	*ns = ""
// 	return nil
// }
// func (ns NullableString) Value(value interface{}) (driver.Value, error) {
// 	return string(ns), nil
// }

type NullableTime struct {
	time.Time
}



func (nt *NullableTime) Scan(value interface{}) error {

	parsedTime, valid := value.(time.Time)

	if valid {
		*nt = NullableTime{
			Time: parsedTime,
		}
		return nil
	}
	*nt = NullableTime{
		Time: parsedTime,
	}
	return nil
}

func (nt NullableTime) Value() (driver.Value, error) {
	return time.Time(nt.Time), nil
}

// func (nt NullableTime) MarshalJSON() ([]byte, error) {
// 	val, _ := nt.Value()
// 	byteTime := fmt.Sprintf("\"%s\"", val)
// 	return []byte(byteTime), nil
// }


const LayoutISO = "2006-1-2"
type NullableDate string

func (nd *NullableDate) Scan(value interface{}) error {

	parsedDate, isValidTime := value.(time.Time)
	if isValidTime {
	
		*nd = NullableDate(parsedDate.Format(LayoutISO))
		return nil
	}
	if value == nil {
		*nd = NullableDate("")
		return nil
	}

	return fmt.Errorf("invalid date value")
}



func (nd NullableDate) Value() (driver.Value, error) {
	return string(nd), nil
}

func (nd * NullableDate) UnmarshalJSON(d []byte) error {
	unquotedDate, unquoteErr := strconv.Unquote(string(d))
	if unquoteErr != nil {
		return unquoteErr
	}
	_, parseErr := time.Parse(LayoutISO, unquotedDate)
	
	if parseErr != nil {
		return parseErr
	}
	*nd = NullableDate(unquotedDate)
	return nil
}