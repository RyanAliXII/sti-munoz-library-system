package accessionnumber
type UpdateAccessionNumberBody struct{
	LastValue int `json:"lastValue" binding:"required,min=0"`
}