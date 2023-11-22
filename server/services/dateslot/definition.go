package dateslot

import (
	"fmt"
	"time"
)


type NewSlotBody struct {
	From string `json:"name" binding:"required"`
	To string `json:"description" binding:"required"`
	
}
func (body NewSlotBody)Validate()(map[string]string, error){
	to, from, fieldErrs, err := body.ToTime()
	if err != nil{
		return fieldErrs, err
	}
	if(to.Before(from)){
		fieldErrs["to"] = "End date cannot be past start date."
		return fieldErrs, fmt.Errorf("end date cannot be past start date")
	}
	return fieldErrs, nil
}
func (body NewSlotBody)ToTime()(time.Time, time.Time, map[string]string, error) {
	fields := make(map[string]string, 0)
	from, err := time.Parse(time.DateOnly, body.From)
	if err != nil {
		fields["from"] = "From field is required."
		return time.Time{}, time.Time{}, fields, err
	}
	to, err := time.Parse(time.DateOnly, body.To)
	if err != nil {
		fields["from"] = "To field is required."
		return time.Time{}, time.Time{}, fields, err
	}
	return to, from, fields, nil
}