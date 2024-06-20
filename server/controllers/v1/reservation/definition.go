package reservation

import (
	"fmt"
	"strings"
	"unicode"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
)

type ReservationBody struct {
	TimeSlotId string `json:"timeSlotId" binding:"required,uuid"`
	DateSlotId	string `json:"dateSlotId" binding:"required,uuid"`
	DeviceId string `json:"deviceId" binding:"required,uuid"`
}
type CancellationBody struct {
	Remarks string `json:"remarks"`
}
type ReservationFilter struct {
	From string  `form:"from"`
	To string `form:"to"`
    Status []int `form:"status[]"`
	Devices []string `form:"devices[]"`
	SortBy string  `form:"sortBy"`
	Order string  `form:"order"`
	filter.Filter
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