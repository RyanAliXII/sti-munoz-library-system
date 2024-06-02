package penalty

import (
	"mime/multipart"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/gin-gonic/gin"
)
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

type SettlePenaltyBody struct {
	Remarks string `form:"remarks"`
	Proof *multipart.FileHeader `form:"proof"`
}
type  PenaltyFilter struct {
	From string `form:"from"`
	To string `form:"to"`
	Min float64 `form:"min"`
	Max float64 `form:"max"`
	Status string `form:"status"`
	SortBy string `form:"sortBy"`
	Order string `form:"order"`
	filter.Filter
}
func NewPenaltyFilter(ctx * gin.Context) PenaltyFilter{
	p := PenaltyFilter{}
	ctx.BindQuery(&p)
	p.Filter.ExtractFilter(ctx)
	return p
}
