package model

import "time"

type TimeSlot struct {
	Id string `json:"id" db:"id"`
	StartTime string `json:"startTime" db:"start_time"`
	EndTime string `json:"endTime" db:"end_time"`
	ProfileId string `json:"profileId" db:"profile_id"`
}
func(m TimeSlot)Validate() error {
	const layout = "03:04 PM"
	_, err := time.Parse(layout, m.StartTime)
	if err != nil {
		return err
	}
	_, err = time.Parse(layout, m.EndTime)
	if err != nil {
		return err
	}
	return nil
}