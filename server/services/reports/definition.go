package reports

import (
	"errors"
	"time"
)


type ReportFilter struct {
	From string `json:"from" form:"from"`
	To string `json:"to" form:"to"`
}

func(filter * ReportFilter)Validate() error {
	fromTime, err := time.Parse(time.DateOnly, filter.From)
	if err != nil{
		return errors.New("invalid from date")
	}
	toTime, err := time.Parse(time.DateOnly, filter.To)
	if err != nil {
		return errors.New("invalid to date")
	}
	if(fromTime.After(toTime)){
		return errors.New("from time cannot be greater than to time")
	}

	return nil
}

func(filter * ReportFilter)ToReadableDate() (error){
	fromTime, err := time.Parse(time.DateOnly, filter.From)
	if err != nil{
		return errors.New("invalid from date")
	}
	toTime, err := time.Parse(time.DateOnly, filter.To)
	if err != nil {
		return errors.New("invalid to date")
	}
	if(fromTime.After(toTime)){
		return errors.New("from time cannot be greater than to time")
	}
	TextDate := "January 2, 2006"
	filter.From = fromTime.Format(TextDate)
	filter.To = toTime.Format(TextDate)
	return nil
}