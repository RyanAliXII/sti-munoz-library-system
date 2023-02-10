package db

import (
	"database/sql/driver"
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
