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
	_, err := repo.db.Exec("INSERT INTO services.time_slot_profile(name) VALUES($1)", profile.Name)
	return err
}
func(repo * TimeSlotProfile)GetProfiles()([]model.TimeSlotProfile, error) {
	profiles := make([]model.TimeSlotProfile, 0)
	query := `SELECT id, name FROM services.time_slot_profile where deleted_at is null ORDER BY created_at DESC`
	err := repo.db.Select(&profiles, query)
	return profiles, err
}
func(repo * TimeSlotProfile)UpdateProfile(profile model.TimeSlotProfile) error {
	_, err := repo.db.Exec("UPDATE services.time_slot_profile set name = $1 where deleted_at is null and id = $2", profile.Name, profile.Id)
	return err
}
func(repo * TimeSlotProfile)DeleteProfile(id string) error {
	_, err := repo.db.Exec("UPDATE services.time_slot_profile set deleted_at = now() where id = $1 and deleted_at is null", id)
	return err
}