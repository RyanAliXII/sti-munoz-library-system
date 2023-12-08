package penalty






type AddPenaltyBody struct {
	Description string `json:"description" binding:"required"`
	Amount      float64    `json:"amount" binding:"required,min=1"`
	Item string `json:"item" binding:"required,min=1"`
	AccountId string `json:"accountId" binding:"required,uuid"`

}
type EditPenaltyBody struct {
	Id string `json:"id" binding:"required,uuid"`
	Description string `json:"description" binding:"required"`
	Item string `json:"item" binding:"required,min=1"`
	Amount      float64    `json:"amount" binding:"required,min=1"`
	AccountId string `json:"accountId" binding:"required,uuid"`
}