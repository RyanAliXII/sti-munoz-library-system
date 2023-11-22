package model

import "encoding/json"

type TimeSlotProfile struct {
	Id string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	TimeSlots TimeSlots `json:"timeSlots" db:"time_slots"`
}

type TimeSlots []TimeSlot
func (instance * TimeSlots) Scan (value interface{}) error{
	val, valid := value.([]byte)
	if (valid){
		unmarshalErr := json.Unmarshal(val,instance)
		if unmarshalErr != nil {
			*instance = make(TimeSlots, 0)
		}

	} else {
		*instance = make(TimeSlots, 0)
	}
	return nil
}