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

type TimeSlotProfileJSON struct {
	TimeSlotProfile 
}

func (instance * TimeSlotProfileJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := TimeSlotProfileJSON{
		TimeSlotProfile:TimeSlotProfile{},
	}
	if valid {
		unmarshalErr := json.Unmarshal(val, instance)
		if unmarshalErr != nil {
			*instance = INITIAL_DATA_ON_ERROR
		}
	} else {
		*instance = INITIAL_DATA_ON_ERROR
	}
	return nil

}