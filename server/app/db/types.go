package db

import (
	"database/sql/driver"
	"fmt"
	"strconv"
	"time"
)



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





type NullableDate string

func (nd *NullableDate) Scan(value interface{}) error {

	parsedDate, isValidTime := value.(time.Time)
	if isValidTime {
		*nd = NullableDate(parsedDate.Format(time.DateOnly))
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
	if(string(d) == "null"){
		*nd = NullableDate("")
		return nil
	}
	unquotedDate, unquoteErr := strconv.Unquote(string(d))
	if unquoteErr != nil {
		return unquoteErr
	}
	_, parseErr := time.Parse(time.DateOnly, unquotedDate)
	if parseErr != nil {
		return parseErr
	}
	*nd = NullableDate(unquotedDate)
	return nil
}