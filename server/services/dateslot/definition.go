package dateslot

import (
	"fmt"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
)


type NewSlotBody struct {
	From string `json:"from" binding:"required"`
	To string `json:"to" binding:"required"`
	ProfileId  string `json:"profileId" binding:"required"`
	
}
func (body NewSlotBody)Validate()(map[string]string, error){
	from, to, fieldErrs, err := body.ToTime()
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
	return from, to, fields, nil
}
func (body NewSlotBody)ToModel()([]model.DateSlot) {
	slots := make([]model.DateSlot, 0)
	from, to, _, _ := body.ToTime()
	duration := to.Sub(from)
	days := int(duration.Hours() / 24)
	for i := 0; i <= days; i++ {
		currentDate := from.Add(time.Duration(i) * 24 * time.Hour)
		slots = append(slots, model.DateSlot{
			Date: currentDate.Format(time.DateOnly),
			ProfileId: body.ProfileId,
		})
	}
	return slots
}

type DateSlotRange struct{
	Start  string `json:"start" form:"start"`
	End string `json:"end" form:"end"`
}
func(body DateSlotRange)Validate() error {
	_, err := time.Parse(time.DateOnly, body.Start)
	if err != nil {
		return err
	}
	_, err = time.Parse(time.DateOnly,  body.End)
	if err != nil {

		return err
	}
	return nil
}