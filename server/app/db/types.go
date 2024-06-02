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

func (nd *NullableDate)Scan(value interface{}) error {
	if value == nil {
		*nd = NullableDate("")
		return nil
	}
	datetime, isValid := value.(time.Time)
	if isValid {
		*nd = NullableDate(datetime.Format(time.DateOnly))
		return nil
	}
	dateStr := value.(string)
	_, err := time.Parse(time.DateOnly, dateStr)
	if err == nil {
		*nd = NullableDate(dateStr)
		return nil
	}
	return fmt.Errorf("invalid date")
}
func (nd NullableDate) Value() (driver.Value, error) {
	_, err := time.Parse(time.DateOnly, string(nd))
	if err != nil {
		return "", fmt.Errorf("invalid date")
	}
	return string(nd), nil
}
func (nd NullableDate)ToString() string{
	return string(nd)
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
	*nd = NullableDate(unquotedDate)
	return nil
}