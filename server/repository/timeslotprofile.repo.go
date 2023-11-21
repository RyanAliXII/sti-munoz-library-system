package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type TimeSlotProfile struct {
	db * sqlx.DB
}

func NewTimeSlotProfileRepository() TimeSlotProfileRepository {
	return &TimeSlotProfile{
		db: db.Connect(),
	}
}
type TimeSlotProfileRepository interface{
	NewProfile (model.TimeSlotProfile) error
	GetProfiles ()([]model.TimeSlotProfile, error)
	UpdateProfile (model.TimeSlotProfile)error
	DeleteProfile(id string) error
}
func(repo * TimeSlotProfile)NewProfile(profile model.TimeSlotProfile) error {
	return nil
}
func(repo * TimeSlotProfile)GetProfiles()([]model.TimeSlotProfile, error) {
	profiles := make([]model.TimeSlotProfile, 0)
	return profiles, nil
}
func(repo * TimeSlotProfile)UpdateProfile(profile model.TimeSlotProfile) error {
	return nil
}
func(repo * TimeSlotProfile)DeleteProfile(id string) error {
	return nil
}