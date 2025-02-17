package user
type UserType struct {
	Name string `json:"name" binding:"required,max=50"`
	MaxAllowedBorrowedBooks int `json:"maxAllowedBorrowedBooks" binding:"required,min=0"`
	MaxUniqueDeviceReservationPerDay int `json:"maxUniqueDeviceReservationPerDay" binding:"required,min=0"`
	HasProgram bool `json:"hasProgram"`
}

type UserTypeFilter struct {
	HasProgram bool `form:"hasProgram"`
}
type UserProgram struct {
	Code string `json:"code" binding:"required,max=50"`
	Name string `json:"name" binding:"required,max=255"`
	UserTypeId int `json:"userTypeId" binding:"required,min=1"`
}