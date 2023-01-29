package inventory

type InventoryBody struct {
	Name string `json:"name" binding:"required,gte=1,lte=150"`
}
