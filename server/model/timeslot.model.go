package model

type TimeSlot struct {
	Id string `json:"id" db:"id"`
	StartTime string `json:"startTime" db:"start_time"`
	EndTime string `json:"endTime" db:"end_time"`
	ProfileId string `json:"profileId" db:"profile_id"`
}