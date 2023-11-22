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
	GetProfileById(id string)(model.TimeSlotProfile, error)
}
func(repo * TimeSlotProfile)NewProfile(profile model.TimeSlotProfile) error {
	_, err := repo.db.Exec("INSERT INTO services.time_slot_profile(name) VALUES($1)", profile.Name)
	return err
}
func(repo * TimeSlotProfile)GetProfiles()([]model.TimeSlotProfile, error) {
	profiles := make([]model.TimeSlotProfile, 0)
	query := `SELECT tsp.id, 
	tsp.name,
	COALESCE(
	JSON_AGG(JSON_BUILD_OBJECT(
	'id', ts.id, 
	'startTime', ts.start_time,
	'profileId', ts.profile_id,
	'endTime', ts.end_time)), '[]') as time_slots
	from services.time_slot_profile as tsp 
	LEFT JOIN services.time_slot as ts on tsp.id = ts.profile_id and ts.deleted_at is null
	where tsp.deleted_at is null
	GROUP BY tsp.id ORDER BY tsp. created_at DESC`
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
func(repo *TimeSlotProfile)GetProfileById(id string)(model.TimeSlotProfile, error){
	profile := model.TimeSlotProfile{}
	err := repo.db.Get(&profile, `SELECT tsp.id, 
	tsp.name,
	COALESCE(
	JSON_AGG(JSON_BUILD_OBJECT(
	'id', ts.id, 
	'profileId',ts.profile_id, 
	'startTime', ts.start_time,
	'endTime', ts.end_time))FILTER (where ts.id is not null), '[]') as time_slots
	from services.time_slot_profile as tsp 
	LEFT JOIN services.time_slot as ts on tsp.id = ts.profile_id and ts.deleted_at is null
	where tsp.deleted_at is null and tsp.id = $1
	GROUP BY tsp.id ORDER BY tsp. created_at DESC LIMIT 1`, id)
	return profile,err
}