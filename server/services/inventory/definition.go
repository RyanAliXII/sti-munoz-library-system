package inventory

type InventoryBody struct {
	Name string `json:"name" binding:"required,gte=1,lte=150"`
}
type AuditBookCopyBody struct{
	AccessionId string `json:"accessionId" binding:"required,uuid"`
}