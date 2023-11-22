package model

type DateSlot struct {
	Id string `json:"id" db:"id"`
	Date string `json:"date" db:"date"`
    ProfileId string `json:"profileId" db:"profile_id"`
	TimeSlotProfile TimeSlotProfileJSON `json:"timeSlotProfile" db:"time_slot_profile"`
}