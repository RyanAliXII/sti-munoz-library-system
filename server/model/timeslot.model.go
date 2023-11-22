package model

import (
	"fmt"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)

type TimeSlot struct {
	Id string `json:"id" db:"id"`
	StartTime string `json:"startTime" db:"start_time"`
	EndTime string `json:"endTime" db:"end_time"`
	ProfileId string `json:"profileId" db:"profile_id"`
}
func(m TimeSlot)Validate() (map[string]string, error) {
	fields := make(map[string]string, 0)
	const layout = "03:04 PM"
	startTime, err := time.Parse(layout, m.StartTime)
	if err != nil {
		fields["startTime"] = "Start time is required."
		return fields, err
	}
	endTime, err := time.Parse(layout, m.EndTime)
	if err != nil {
		fields["endTime"] = "End time is required."
		return fields, err
	}

	if(endTime.Before(startTime)){
		fields["endTime"] = "End time cannot be past start time."
		return fields, fmt.Errorf("end time is past start time")
	}
	if(startTime.Equal(endTime)){
		fields["endTime"] = "End time cannot be equal to start time."
		return fields, fmt.Errorf("end time cannot be equal to start time")
	}
	
    isExistOrOverlap := true
	query := `SELECT EXISTS (SELECT 1 FROM services.time_slot where start_time >= $1 and end_time <= $2 and profile_id = $3 and deleted_at is null)`
	db := db.Connect()
	err = db.Get(&isExistOrOverlap, query,m.StartTime, m.EndTime, m.ProfileId)
	if err != nil{
		fields["startTime"] = "Start time is required."
		fields["endTime"] = "End time is required."
		return fields, err
	}
	if(isExistOrOverlap){
		fields["startTime"] = "Selected time slot overlaps with current defined slots."
		fields["endTime"] = "Selected time slot overlaps with current defined slots."
		return fields, fmt.Errorf("timeslot overlaps")
	}
	return fields, err
}