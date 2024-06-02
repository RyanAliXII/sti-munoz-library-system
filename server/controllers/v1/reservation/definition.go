package reservation

import (
	"fmt"
	"strings"
	"unicode"
)

type ReservationBody struct {
	TimeSlotId string `json:"timeSlotId" binding:"required,uuid"`
	DateSlotId	string `json:"dateSlotId" binding:"required,uuid"`
	DeviceId string `json:"deviceId" binding:"required,uuid"`
}
type CancellationBody struct {
	Remarks string `json:"remarks"`
}

func(b  * CancellationBody)Validate() error {
	remarks := strings.Map(func(r rune) rune {
		if(unicode.IsSpace(r)){
			return -1
		}
		return r
	}, b.Remarks)
	if(len(remarks) == 0){
		return fmt.Errorf("remarks is required")
	}
	return nil
}