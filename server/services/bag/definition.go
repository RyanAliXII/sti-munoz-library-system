package bag

type BagItem struct {
	AccessionId  string `json:"accessionId" binding:"required,uuid"`
}
