package reservation

import "github.com/gin-gonic/gin"



type Reservation struct {}

func NewReservationController () ReservationController {
	return &Reservation{}
}
type ReservationController interface {
	NewReservation(ctx * gin.Context)
}
func(reservation * Reservation)NewReservation(ctx * gin.Context){

}